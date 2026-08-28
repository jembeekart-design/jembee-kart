import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";

import { db } from "@/firebase/config";

export interface Category {
  id: string;

  title?: string;

  image?: string;

  backgroundColor?: string;

  textColor?: string;

  position?: number;

  visible?: boolean;
}

export function listenCategories(
  callback: (
    categories: Category[]
  ) => void
) {
  const categoriesQuery =
    query(
      collection(
        db,
        "categories"
      ),
      where(
        "visible",
        "==",
        true
      ),
      orderBy(
        "position",
        "asc"
      )
    );

  return onSnapshot(
    categoriesQuery,
    (snapshot) => {
      const categories: Category[] =
        snapshot.docs.map(
          (document) => {
            return {
              id: document.id,

              ...(document.data() as Omit<
                Category,
                "id"
              >)
            };
          }
        );

      callback(categories);
    }
  );
}
