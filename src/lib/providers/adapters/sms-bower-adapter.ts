import type { ProviderConfig } from '../base-adapter';
import { SmsActivateAdapter } from './sms-activate-adapter';

export class SMSBowerAdapter extends SmsActivateAdapter {
  constructor(providerId: string, config: ProviderConfig, logger?: any) {
    super(providerId, config, {
      name: 'SMSBower',
      baseUrl: 'https://smsbower.page/stubs/handler_api.php'
    }, logger);
  }
}
