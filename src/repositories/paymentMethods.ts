export {
  archivePaymentMethod,
  deletePaymentMethod,
  listenPaymentMethods,
  upsertPaymentMethod,
} from "./payment-methods";
import type { PaymentMethod } from "@/core/types/money";
import { deletePaymentMethod, listenPaymentMethods, upsertPaymentMethod } from "./payment-methods";
import type { Repository } from "./types";

export const paymentMethodsRepository: Repository<PaymentMethod> = {
  get: async () => null,
  list: (userId) =>
    new Promise((resolve, reject) => {
      const stop = listenPaymentMethods(
        userId,
        (rows) => {
          stop();
          resolve(rows);
        },
        reject,
      );
    }),
  upsert: (record) =>
    upsertPaymentMethod({
      id: record.id,
      userId: record.userId,
      name: record.name,
      sortOrder: record.sortOrder,
      archived: record.archived,
    }),
  remove: deletePaymentMethod,
};
