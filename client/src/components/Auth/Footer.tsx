import { useLocalize } from '~/hooks';
import { TStartupConfig } from 'librechat-data-provider';

function Footer({ startupConfig }: { startupConfig: TStartupConfig | null | undefined }) {
  const localize = useLocalize();
  if (!startupConfig) {
    return null;
  }
  const privacyPolicy = startupConfig.interface?.privacyPolicy;
  const termsOfService = startupConfig.interface?.termsOfService;

  const privacyPolicyRender = privacyPolicy?.externalUrl && (
    <button
      type="button"
      className="rounded text-sm text-gray-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={() => window.open(privacyPolicy.externalUrl, '_blank')}
    >
      {localize('com_ui_privacy_policy')}
    </button>
  );

  const termsOfServiceRender = termsOfService?.externalUrl && (
    <button
      type="button"
      className="rounded text-sm text-gray-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={() => window.open(termsOfService.externalUrl, '_blank')}
    >
      {localize('com_ui_terms_of_service')}
    </button>
  );

  return (
    <div className="align-end m-4 flex justify-center gap-2" role="contentinfo">
      {privacyPolicyRender}
      {privacyPolicyRender && termsOfServiceRender && (
        <div className="border-r-[1px] border-gray-300 dark:border-gray-600" />
      )}
      {termsOfServiceRender}
    </div>
  );
}

export default Footer;
