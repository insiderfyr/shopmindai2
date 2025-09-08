import React, { memo } from 'react';
import ToggleSwitch from '../ToggleSwitch';
import store from '~/store';

const toggleSwitchConfigs = [
  {
    stateAtom: store.textToSpeech,
    localizationKey: 'com_nav_text_to_speech',
    switchId: 'textToSpeech',
    hoverCardText: 'com_nav_info_text_to_speech',
    key: 'textToSpeech',
  },
  {
    stateAtom: store.speechToText,
    localizationKey: 'com_nav_speech_to_text',
    switchId: 'speechToText',
    hoverCardText: 'com_nav_info_speech_to_text',
    key: 'speechToText',
  },
];

const Speech = memo(() => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Speech Settings
        </h3>
        <div className="flex flex-col gap-2">
          {toggleSwitchConfigs.map((config) => (
            <ToggleSwitch
              key={config.key}
              stateAtom={config.stateAtom}
              localizationKey={config.localizationKey}
              switchId={config.switchId}
              hoverCardText={config.hoverCardText}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

Speech.displayName = 'Speech';

export default Speech;
