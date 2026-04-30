// src/shared/api/interceptors.ts

type Req = { url: string; init: RequestInit };

// 🔹 request interceptors (chainable)
const requestInterceptors: Array<(req: Req) => Promise<Req> | Req> = [
  async (req) => {
    // 🔍 logging (can be toggled by featureFlags)
    if (typeof window !== "undefined") {
      console.debug("[API:req]", req.url, req.init.method);
    }
    return req;
  },
];

// 🔹 response interceptors
const responseInterceptors: Array<
  (res: Response, req: Req) => Promise<Response> | Response
> = [
  async (res, req) => {
    // 🔁 simple retry on 502/503
    if ([502, 503].includes(res.status)) {
      await new Promise((r) => setTimeout(r, 300));
      return fetch(req.url, req.init);
    }
    return res;
  },

  async (res) => {
    // 🔐 handle unauthorized (logout / redirect hook)
    if (res.status === 401 && typeof window !== "undefined") {
      // e.g., clearSession(); router.push("/login")
      console.warn("[API] 401 Unauthorized");
    }
    return res;
  },
];

export const applyRequestInterceptors = async (req: Req) => {
  let next = req;
  for (const i of requestInterceptors) {
    next = await i(next);
  }
  return next;
};

export const applyResponseInterceptors = async (res: Response, req: Req) => {
  let next = res;
  for (const i of responseInterceptors) {
    next = await i(next, req);
  }
  return next;
};

// 🔹 allow adding custom interceptors (A/B tests, feature flags)
export const useRequestInterceptor = (fn: (req: Req) => Promise<Req> | Req) => {
  requestInterceptors.push(fn);
};

export const useResponseInterceptor = (
  fn: (res: Response, req: Req) => Promise<Response> | Response
) => {
  responseInterceptors.push(fn);
};