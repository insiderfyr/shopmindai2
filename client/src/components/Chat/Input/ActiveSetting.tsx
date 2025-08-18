import { useLocalize } from '~/hooks';

export default function ActiveSetting() {
  const localize = useLocalize();

  return (
    <div className="text-token-text-tertiary space-x-2 overflow-hidden text-ellipsis text-sm font-light">
      {localize('com_ui_talking_to')}{' '}
      <span className="text-token-text-secondary font-medium">
        {localize('com_ui_latest_tailwind_css_gpt')}
      </span>
    </div>
  );
}
