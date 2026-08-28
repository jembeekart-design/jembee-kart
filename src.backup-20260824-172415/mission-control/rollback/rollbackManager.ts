import { rollback } from "./rollbackEngine";

export const RollbackManager = {
  restore(backupPath: string) {
    return rollback(backupPath);
  },
};
