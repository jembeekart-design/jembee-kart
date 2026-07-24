import {
  createBackup,
} from "./backupEngine";

import {
  restoreBackup,
} from "./restoreBackup";

import {
  listBackups,
} from "./listBackups";

export const BackupManager = {
  create() {
    return createBackup();
  },

  restore(backupPath: string) {
    return restoreBackup(backupPath);
  },

  list() {
    return listBackups();
  },
};
