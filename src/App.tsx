import { LobbyScreen } from './components/Lobby/LobbyScreen';
import { InfoButton } from './components/InfoButton/InfoButton';
import { SettingsButton } from './components/SettingsButton/SettingsButton';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? window.location.origin;

export function App() {
  return (
    <>
      <LobbyScreen serverURL={SERVER_URL} />
      <SettingsButton />
      <InfoButton />
    </>
  );
}
