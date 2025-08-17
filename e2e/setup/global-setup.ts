import { FullConfig } from '@playwright/test';
import authenticate from './authenticate';
import localUser from '../config.local';

async function globalSetup(config: FullConfig) {
  const user = {
    name: localUser.name,
    email: localUser.email,
    password: localUser.password,
  };

  await authenticate(config, user);
}

export default globalSetup;
