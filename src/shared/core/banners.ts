export type Banner = {
  id: string;
  image: string;
  link?: string;
};

export const getActiveBanners = (banners: Banner[]) =>
  banners.filter(Boolean);