import { TranslationKeys, useLocalize } from '~/hooks';
import { TStartupConfig } from 'librechat-data-provider';
import { ErrorMessage } from '~/components/Auth/ErrorMessage';
import SocialLoginRender from './SocialLoginRender';
import { BlinkAnimation } from './BlinkAnimation';
import { ThemeSelector } from '~/components';
import { Banner } from '../Banners';
import Footer from './Footer';

function AuthLayout({
  children,
  header,
  isFetching,
  startupConfig,
  startupConfigError,
  pathname,
  error,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  isFetching: boolean;
  startupConfig: TStartupConfig | null | undefined;
  startupConfigError: unknown | null | undefined;
  pathname: string;
  error: TranslationKeys | null;
}) {
  const localize = useLocalize();

  const hasStartupConfigError = startupConfigError !== null && startupConfigError !== undefined;
  const DisplayError = () => {
    if (hasStartupConfigError) {
      return (
        <div className="mx-auto sm:max-w-sm">
          <ErrorMessage>{localize('com_auth_error_login_server')}</ErrorMessage>
        </div>
      );
    } else if (error === 'com_auth_error_invalid_reset_token') {
      return (
        <div className="mx-auto sm:max-w-sm">
          <ErrorMessage>
            {localize('com_auth_error_invalid_reset_token')}{' '}
            <a className="font-semibold text-[#4d8eff] hover:underline" href="/forgot-password">
              {localize('com_auth_click_here')}
            </a>{' '}
            {localize('com_auth_to_try_again')}
          </ErrorMessage>
        </div>
      );
    } else if (error != null && error) {
      return (
        <div className="mx-auto sm:max-w-sm">
          <ErrorMessage>{localize(error)}</ErrorMessage>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-blue-50 dark:bg-[#182533]"
      style={
        {
          '--page-bg': 'rgb(239, 246, 255)',
          '--page-bg-dark': '#182533',
        } as React.CSSProperties
      }
    >
      <Banner />
      <BlinkAnimation active={isFetching}>
        <div className="-ml-20 mt-4 flex h-14 items-center justify-center gap-3">
          <img
            src="/assets/logo.svg"
            className="h-full object-contain"
            alt={localize('com_ui_logo', { 0: startupConfig?.appTitle ?? 'LibreChat' })}
          />
          <h1 className="text-2xl font-bold text-foreground">
            ShopMind<span className="text-[#4d8eff]">AI</span>
          </h1>
        </div>
      </BlinkAnimation>
      <DisplayError />
      <div className="absolute bottom-0 left-0 md:m-4">
        <ThemeSelector />
      </div>

      <div className="flex flex-grow items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="w-authPageWidth overflow-hidden px-6 py-4 sm:max-w-md sm:rounded-lg">
            {!hasStartupConfigError && !isFetching && (
              <h1
                className="mb-4 text-center text-3xl font-semibold text-black dark:text-white"
                style={{ userSelect: 'none' }}
              >
                {header}
              </h1>
            )}
            {children}
            {!pathname.includes('2fa') &&
              (pathname.includes('login') || pathname.includes('register')) && (
                <SocialLoginRender startupConfig={startupConfig} />
              )}
          </div>
        </div>
      </div>
      <Footer startupConfig={startupConfig} />
    </div>
  );
}

export default AuthLayout;
