import axios, { type AxiosInstance } from 'axios';
import {
  BaseProviderAdapter,
  type OrderRequest,
  type OrderResponse,
  type OrderStatus,
  type ProviderConfig,
  type ProviderHealth,
  type ServiceMapping
} from '../base-adapter';

type AdapterOptions = { name: string; baseUrl: string };
export type SmsActivateCountry = { id: string; name: string };
type NamedCode = SmsActivateCountry;
type CountryServiceOptions = { query?: string; limit?: number };

export type ResolvedSmsActivateService = {
  externalId: string;
  externalName: string;
  price: number;
  stock: number;
};

export abstract class SmsActivateAdapter extends BaseProviderAdapter {
  private client: AxiosInstance;
  private providerName: string;

  protected constructor(providerId: string, config: ProviderConfig, options: AdapterOptions, logger?: any) {
    super(providerId, config, logger);
    this.providerName = options.name;
    this.client = axios.create({
      baseURL: config.baseUrl || options.baseUrl,
      timeout: config.timeout || 20000,
      headers: { 'User-Agent': 'Acctrise/1.0' },
      responseType: 'text',
      transformResponse: [(value) => value]
    });
  }

  async authenticate(): Promise<boolean> {
    try {
      const value = await this.request('getBalance', {}, false);
      return String(value).startsWith('ACCESS_BALANCE:');
    } catch {
      return false;
    }
  }

  async fetchServices(): Promise<ServiceMapping[]> {
    const services = await this.fetchServiceList();
    return services.map((service) => ({
      externalId: service.id,
      serviceId: service.id,
      name: service.name,
      price: 0,
      minOrder: 1,
      maxOrder: 1,
      availability: 'Availability checked at purchase',
      friendlyLabel: 'Verification service',
      description: 'SMS verification service'
    }));
  }

  async fetchCountries(): Promise<SmsActivateCountry[]> {
    return this.fetchCountryList();
  }

  async fetchServicesForCountry(countryName: string, options: CountryServiceOptions = {}): Promise<ServiceMapping[]> {
    const [countries, services] = await Promise.all([this.fetchCountryList(), this.fetchServiceList()]);
    const country = bestNameMatch(countries, countryName);
    if (!country) return [];
    const prices = await this.request('getPrices', { country: country.id });
    const query = normalized(options.query || '');
    return services.flatMap((service) => {
      if (query && !normalized(service.name).includes(query)) return [];
      const offer = readOffer(prices, country.id, service.id);
      if (!offer || offer.stock < 1 || offer.price <= 0) return [];
      return [{ externalId: `${country.id}:${service.id}`, serviceId: service.id, name: service.name, price: offer.price, minOrder: 1, maxOrder: 1, stock: offer.stock, countryId: country.id, countryName: country.name, availability: `${offer.stock} available`, friendlyLabel: 'Verification service', description: 'SMS verification service' } satisfies ServiceMapping];
    }).sort((a, b) => a.price - b.price).slice(0, options.limit || 30);
  }

  async resolveService(countryName: string, serviceName: string): Promise<ResolvedSmsActivateService | null> {
    const [countries, services] = await Promise.all([this.fetchCountryList(), this.fetchServiceList()]);
    const country = bestNameMatch(countries, countryName);
    const service = bestNameMatch(services, serviceName);
    if (!country || !service) return null;
    const prices = await this.request('getPrices', { country: country.id, service: service.id });
    const offer = readOffer(prices, country.id, service.id);
    if (!offer || offer.stock < 1 || offer.price <= 0) return null;
    return {
      externalId: `${country.id}:${service.id}`,
      externalName: service.name,
      price: offer.price,
      stock: offer.stock
    };
  }

  async placeOrder(request: OrderRequest): Promise<OrderResponse> {
    const [country, service] = splitExternalId(request.serviceId);
    let value: any;
    try {
      value = await this.request('getNumberV2', { country, service });
    } catch (error) {
      if (axios.isAxiosError(error) && (!error.response || error.code === 'ECONNABORTED')) {
        const uncertain = new Error(`${this.providerName} purchase outcome is unknown; automatic failover was stopped.`) as Error & { failoverSafe: boolean };
        uncertain.failoverSafe = false;
        throw uncertain;
      }
      throw error;
    }
    if (!value || typeof value !== 'object') throw new Error(`${this.providerName} returned an invalid response.`);
    const activationId = value.activationId ?? value.activation_id;
    const phoneNumber = value.phoneNumber ?? value.phone_number;
    if (!activationId || !phoneNumber) throw new Error(`${this.providerName} could not provide a number.`);
    return {
      externalOrderId: String(activationId),
      status: 'pending',
      message: `Number: ${String(phoneNumber)}`,
      data: {
        activationId: String(activationId),
        number: String(phoneNumber),
        activationCost: Number(value.activationCost || 0)
      }
    };
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderStatus> {
    const response = String(await this.request('getStatus', { id: externalOrderId }, false));
    const separator = response.indexOf(':');
    const providerStatus = separator >= 0 ? response.slice(0, separator) : response;
    const payload = separator >= 0 ? response.slice(separator + 1).trim() : '';
    const code = providerStatus === 'STATUS_OK' ? payload : '';
    return {
      externalOrderId,
      status: providerStatus === 'STATUS_OK' ? 'completed'
        : providerStatus === 'STATUS_CANCEL' ? 'refunded'
          : providerStatus.startsWith('STATUS_WAIT') ? 'processing' : 'unknown',
      progress: code ? 100 : 0,
      message: code ? `Code received: ${code}` : 'Waiting for SMS...',
      data: code ? { code, sms: code } : {},
      lastUpdated: new Date()
    };
  }

  async refundOrder(externalOrderId: string): Promise<boolean> {
    try {
      const value = await this.request('setStatus', { id: externalOrderId, status: '8' }, false);
      return String(value) === 'ACCESS_CANCEL';
    } catch (error) {
      this.log('warn', `${this.providerName} cancellation failed`, {
        externalOrderId,
        error: error instanceof Error ? error.message : 'Unknown cancellation error'
      });
      return false;
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const isHealthy = await this.authenticate();
    return {
      isHealthy,
      status: isHealthy ? 'active' : 'error',
      lastCheck: new Date(),
      message: isHealthy ? `${this.providerName} is operational` : `${this.providerName} is unreachable`
    };
  }

  async getSupportedPaymentMethods(): Promise<string[]> { return ['wallet']; }

  private async fetchCountryList(): Promise<NamedCode[]> {
    const value = await this.request('getCountries');
    const rows = Array.isArray(value) ? value : Object.values(value || {});
    return rows.map((item: any) => ({
      id: String(item.id ?? item.code ?? ''),
      name: String(item.eng ?? item.name ?? '')
    })).filter((item: NamedCode) => item.id && item.name);
  }

  private async fetchServiceList(): Promise<NamedCode[]> {
    const value = await this.request('getServicesList');
    const rows = Array.isArray(value?.services) ? value.services : Array.isArray(value) ? value : [];
    return rows.map((item: any) => ({
      id: String(item.code ?? item.id ?? ''),
      name: String(item.name ?? '')
    })).filter((item: NamedCode) => item.id && item.name);
  }

  private async request(action: string, params: Record<string, string> = {}, parseJson = true): Promise<any> {
    const response = await this.client.get('', { params: { api_key: this.config.apiKey, action, ...params } });
    const raw = String(response.data ?? '').trim();
    if (/^(BAD_|NO_|ERROR|WRONG_|EARLY_CANCEL_DENIED)/i.test(raw)) {
      throw new Error(`${this.providerName}: ${raw.split(':')[0]}`);
    }
    if (!parseJson) return raw;
    try { return JSON.parse(raw); } catch { return raw; }
  }
}

function splitExternalId(externalId: string): [string, string] {
  const separator = externalId.indexOf(':');
  if (separator < 1 || separator === externalId.length - 1) throw new Error('Provider mapping is invalid.');
  return [externalId.slice(0, separator), externalId.slice(separator + 1)];
}

function normalized(value: string): string {
  return value.toLowerCase().replace(/\b(inc|app|messenger|verification)\b/g, '').replace(/[^a-z0-9]+/g, '');
}

function bestNameMatch(items: NamedCode[], wanted: string): NamedCode | null {
  const target = normalized(wanted);
  return items.find((item) => normalized(item.name) === target)
    || items.find((item) => normalized(item.name).includes(target) || target.includes(normalized(item.name)))
    || null;
}

function readOffer(value: any, country: string, service: string): { price: number; stock: number } | null {
  const offer = value?.[country]?.[service] ?? value?.[Number(country)]?.[service];
  if (!offer) return null;
  if (typeof offer.cost !== 'undefined') return { price: Number(offer.cost || 0), stock: Number(offer.count || 0) };
  return Object.entries(offer).map(([price, count]) => ({ price: Number(price), stock: Number(count) }))
    .filter((row) => row.price > 0 && row.stock > 0).sort((a, b) => a.price - b.price)[0] || null;
}
