import {
  collection,
  getDocs,
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

export async function getCategories() {
  try {
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

    const snapshot =
      await getDocs(
        categoriesQuery
      );

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

    return categories;
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error
    );

    return [];
  }
}
