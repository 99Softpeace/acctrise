import type { ProviderConfig } from '../base-adapter';
import { SmsActivateAdapter } from './sms-activate-adapter';

export class GrizzlySMSAdapter extends SmsActivateAdapter {
  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    super(providerId, config, {
      name: 'GrizzlySMS',
      baseUrl: 'https://api.grizzlysms.com/stubs/handler_api.php'
    }, logger);
  }
}
