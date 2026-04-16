// src/services/__tests__/cmsService.test.ts

import {
  getAboutUs,
  getCookiePolicy,
  getFaqList,
  getGuides,
  getBlogs,
  getBlogBySlug,
  getCaseStudies,
  getCaseStudyBySlug,
  getAgencyUseCases,
  getLiveBanner,
  getPricingVersions,
  getClients,
  getMenuItems,
  getIssues,
  calculateROI,
} from "@/services/cmsService";

import {
  submitGuestSupportRequest,
  submitROIQuery,
} from "@/services/supportService";

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeFetchOk = (body: unknown) =>
  jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(String(body)),
  });

const makeFetchOkText = (html: string) =>
  jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue(html),
    json: jest.fn().mockResolvedValue(null),
  });

const makeFetchFail = (status = 500) =>
  jest.fn().mockResolvedValue({ ok: false, status });

beforeEach(() => {
  global.fetch = makeFetchOk({})();
});

afterEach(() => {
  jest.resetAllMocks();
});

// ---------------------------------------------------------------------------
// getAboutUs (AP-009: must call .text() not .json())
// ---------------------------------------------------------------------------

describe("getAboutUs", () => {
  it("test_getAboutUs_returns_string_on_success", async () => {
    global.fetch = makeFetchOkText("<p>about</p>");
    const result = await getAboutUs();
    expect(result).toBe("<p>about</p>");
  });

  it("test_getAboutUs_calls_text_not_json", async () => {
    const mock = makeFetchOkText("<p>about</p>");
    global.fetch = mock;
    await getAboutUs();
    const response = await mock.mock.results[0].value;
    expect(response.text).toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
  });

  it("test_getAboutUs_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getAboutUs()).rejects.toThrow("about failed: 500");
  });

  it("test_getAboutUs_calls_correct_url", async () => {
    global.fetch = makeFetchOkText("<p>about</p>");
    await getAboutUs();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("gofor=about");
  });
});

// ---------------------------------------------------------------------------
// getCookiePolicy (AP-009: must call .text() not .json())
// ---------------------------------------------------------------------------

describe("getCookiePolicy", () => {
  it("test_getCookiePolicy_returns_string_on_success", async () => {
    global.fetch = makeFetchOkText("<p>cookie policy</p>");
    const result = await getCookiePolicy();
    expect(result).toBe("<p>cookie policy</p>");
  });

  it("test_getCookiePolicy_calls_text_not_json", async () => {
    const mock = makeFetchOkText("<p>cookie policy</p>");
    global.fetch = mock;
    await getCookiePolicy();
    const response = await mock.mock.results[0].value;
    expect(response.text).toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
  });

  it("test_getCookiePolicy_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getCookiePolicy()).rejects.toThrow("cookiepolicy failed: 500");
  });

  it("test_getCookiePolicy_calls_correct_url", async () => {
    global.fetch = makeFetchOkText("<p>cookie policy</p>");
    await getCookiePolicy();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("gofor=cookiepolicy");
  });
});

// ---------------------------------------------------------------------------
// getFaqList
// ---------------------------------------------------------------------------

describe("getFaqList", () => {
  it("test_getFaqList_returns_array_on_success_without_params", async () => {
    const mockFaqs = [{ faq_id: 1, question: "Q?", answer: "A" }];
    global.fetch = makeFetchOk(mockFaqs);
    const result = await getFaqList();
    expect(result).toEqual(mockFaqs);
  });

  it("test_getFaqList_appends_category_param_when_provided", async () => {
    global.fetch = makeFetchOk([]);
    await getFaqList({ category: "billing & plans" });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`&category=${encodeURIComponent("billing & plans")}`);
  });

  it("test_getFaqList_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getFaqList()).rejects.toThrow("prefaqlist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getGuides
// ---------------------------------------------------------------------------

describe("getGuides", () => {
  it("test_getGuides_returns_array_on_success", async () => {
    const mockGuides = [{ guide_id: 1, title: "Getting Started" }];
    global.fetch = makeFetchOk(mockGuides);
    const result = await getGuides();
    expect(result).toEqual(mockGuides);
  });

  it("test_getGuides_calls_correct_url", async () => {
    global.fetch = makeFetchOk([]);
    await getGuides();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("gofor=guideslist");
  });

  it("test_getGuides_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getGuides()).rejects.toThrow("guideslist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getBlogs
// ---------------------------------------------------------------------------

describe("getBlogs", () => {
  it("test_getBlogs_returns_array_without_cache_option", async () => {
    const mockBlogs = [{ slug: "first-post", title: "First Post" }];
    global.fetch = makeFetchOk(mockBlogs);
    const result = await getBlogs();
    expect(result).toEqual(mockBlogs);
  });

  it("test_getBlogs_passes_no_store_cache_to_fetch_when_option_provided", async () => {
    global.fetch = makeFetchOk([]);
    await getBlogs({ cache: "no-store" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("test_getBlogs_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getBlogs()).rejects.toThrow("blogslist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getBlogBySlug
// ---------------------------------------------------------------------------

describe("getBlogBySlug", () => {
  it("test_getBlogBySlug_returns_object_for_given_slug", async () => {
    const mockBlog = { slug: "my-blog", title: "My Blog" };
    global.fetch = makeFetchOk(mockBlog);
    const result = await getBlogBySlug("my-blog");
    expect(result).toEqual(mockBlog);
  });

  it("test_getBlogBySlug_uses_encodeURIComponent_for_slug_in_url", async () => {
    global.fetch = makeFetchOk({});
    const slug = "my blog post";
    await getBlogBySlug(slug);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`slug=${encodeURIComponent(slug)}`);
  });

  it("test_getBlogBySlug_passes_cache_option_when_provided", async () => {
    global.fetch = makeFetchOk({});
    await getBlogBySlug("test-slug", { cache: "no-store" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("test_getBlogBySlug_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(404);
    await expect(getBlogBySlug("missing")).rejects.toThrow("getblog failed: 404");
  });
});

// ---------------------------------------------------------------------------
// getCaseStudies
// ---------------------------------------------------------------------------

describe("getCaseStudies", () => {
  it("test_getCaseStudies_returns_array_without_params", async () => {
    const mockStudies = [{ slug: "case-1", title: "Case 1" }];
    global.fetch = makeFetchOk(mockStudies);
    const result = await getCaseStudies();
    expect(result).toEqual(mockStudies);
  });

  it("test_getCaseStudies_appends_category_param_when_provided", async () => {
    global.fetch = makeFetchOk([]);
    await getCaseStudies({ category: "e-commerce" });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`&category=${encodeURIComponent("e-commerce")}`);
  });

  it("test_getCaseStudies_passes_cache_option_when_provided", async () => {
    global.fetch = makeFetchOk([]);
    await getCaseStudies({ cache: "no-store" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("test_getCaseStudies_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getCaseStudies()).rejects.toThrow("casestudylist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getCaseStudyBySlug
// ---------------------------------------------------------------------------

describe("getCaseStudyBySlug", () => {
  it("test_getCaseStudyBySlug_returns_object_for_given_slug", async () => {
    const mockStudy = { slug: "case-one", title: "Case One" };
    global.fetch = makeFetchOk(mockStudy);
    const result = await getCaseStudyBySlug("case-one");
    expect(result).toEqual(mockStudy);
  });

  it("test_getCaseStudyBySlug_passes_cache_option_when_provided", async () => {
    global.fetch = makeFetchOk({});
    await getCaseStudyBySlug("case-one", { cache: "force-cache" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init).toMatchObject({ cache: "force-cache" });
  });

  it("test_getCaseStudyBySlug_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(404);
    await expect(getCaseStudyBySlug("missing")).rejects.toThrow("getcasestudy failed: 404");
  });
});

// ---------------------------------------------------------------------------
// getAgencyUseCases
// ---------------------------------------------------------------------------

describe("getAgencyUseCases", () => {
  it("test_getAgencyUseCases_returns_array_on_success", async () => {
    const mockUseCases = [{ id: 1, title: "Agency Use Case" }];
    global.fetch = makeFetchOk(mockUseCases);
    const result = await getAgencyUseCases();
    expect(result).toEqual(mockUseCases);
  });

  it("test_getAgencyUseCases_internally_uses_no_store_cache", async () => {
    global.fetch = makeFetchOk([]);
    await getAgencyUseCases();
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("test_getAgencyUseCases_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getAgencyUseCases()).rejects.toThrow("agusecaselist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getLiveBanner
// ---------------------------------------------------------------------------

describe("getLiveBanner", () => {
  it("test_getLiveBanner_returns_object_on_success_without_params", async () => {
    const mockBanner = { id: 1, text: "Try Pro" };
    global.fetch = makeFetchOk(mockBanner);
    const result = await getLiveBanner();
    expect(result).toEqual(mockBanner);
  });

  it("test_getLiveBanner_appends_variant_when_non_default", async () => {
    global.fetch = makeFetchOk({});
    await getLiveBanner({ variant: "pro" });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`&variant=${encodeURIComponent("pro")}`);
  });

  it("test_getLiveBanner_does_not_append_variant_when_default", async () => {
    global.fetch = makeFetchOk({});
    await getLiveBanner({ variant: "default" });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("&variant=");
  });

  it("test_getLiveBanner_does_not_append_variant_when_undefined", async () => {
    global.fetch = makeFetchOk({});
    await getLiveBanner({});
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("&variant=");
  });

  it("test_getLiveBanner_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getLiveBanner()).rejects.toThrow("livebanner failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getPricingVersions
// ---------------------------------------------------------------------------

describe("getPricingVersions", () => {
  it("test_getPricingVersions_returns_array_on_success", async () => {
    const mockVersions = [{ version_id: 1, name: "Starter" }];
    global.fetch = makeFetchOk(mockVersions);
    const result = await getPricingVersions();
    expect(result).toEqual(mockVersions);
  });

  it("test_getPricingVersions_calls_correct_url", async () => {
    global.fetch = makeFetchOk([]);
    await getPricingVersions();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("gofor=versionlist");
  });

  it("test_getPricingVersions_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getPricingVersions()).rejects.toThrow("versionlist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getClients
// ---------------------------------------------------------------------------

describe("getClients", () => {
  it("test_getClients_returns_array_without_params", async () => {
    const mockClients = [{ client_id: 1, name: "Acme Corp" }];
    global.fetch = makeFetchOk(mockClients);
    const result = await getClients();
    expect(result).toEqual(mockClients);
  });

  it("test_getClients_appends_category_param_when_provided", async () => {
    global.fetch = makeFetchOk([]);
    await getClients({ category: "retail" });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`&category=${encodeURIComponent("retail")}`);
  });

  it("test_getClients_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getClients()).rejects.toThrow("clientslist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getMenuItems
// ---------------------------------------------------------------------------

describe("getMenuItems", () => {
  it("test_getMenuItems_returns_array_on_success", async () => {
    const mockMenu = [{ id: 1, label: "Home", href: "/" }];
    global.fetch = makeFetchOk(mockMenu);
    const result = await getMenuItems();
    expect(result).toEqual(mockMenu);
  });

  it("test_getMenuItems_internally_uses_no_store_cache", async () => {
    global.fetch = makeFetchOk([]);
    await getMenuItems();
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("test_getMenuItems_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getMenuItems()).rejects.toThrow("menulist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// getIssues
// ---------------------------------------------------------------------------

describe("getIssues", () => {
  it("test_getIssues_returns_array_without_params", async () => {
    const mockIssues = [{ issue_id: 1, title: "Login bug" }];
    global.fetch = makeFetchOk(mockIssues);
    const result = await getIssues();
    expect(result).toEqual(mockIssues);
  });

  it("test_getIssues_appends_category_when_provided", async () => {
    global.fetch = makeFetchOk([]);
    await getIssues({ category: "auth" });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`&category=${encodeURIComponent("auth")}`);
  });

  it("test_getIssues_passes_no_store_cache_when_params_cache_provided", async () => {
    global.fetch = makeFetchOk([]);
    await getIssues({ cache: "no-store" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init).toMatchObject({ cache: "no-store" });
  });

  it("test_getIssues_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(getIssues()).rejects.toThrow("issueslist failed: 500");
  });
});

// ---------------------------------------------------------------------------
// calculateROI
// ---------------------------------------------------------------------------

describe("calculateROI", () => {
  const roiParams = { country: "US", users: 50, weekly_range: 40 };

  it("test_calculateROI_constructs_url_with_all_three_params", async () => {
    global.fetch = makeFetchOk({});
    await calculateROI(roiParams);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`country=${encodeURIComponent("US")}`);
    expect(url).toContain(`users=${encodeURIComponent("50")}`);
    expect(url).toContain(`weekly_range=${encodeURIComponent("40")}`);
  });

  it("test_calculateROI_returns_roi_result_object_on_success", async () => {
    const mockResult = { Return_on_Investment: "120%", Cost_Savings: "$5000", Time_Saved: "200h" };
    global.fetch = makeFetchOk(mockResult);
    const result = await calculateROI(roiParams);
    expect(result).toEqual(mockResult);
  });

  it("test_calculateROI_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(calculateROI(roiParams)).rejects.toThrow("calculateROI failed: 500");
  });
});

// ---------------------------------------------------------------------------
// submitGuestSupportRequest (new in Sprint 6 — in supportService)
// ---------------------------------------------------------------------------

describe("submitGuestSupportRequest", () => {
  it("test_submitGuestSupportRequest_sends_POST_to_api_php", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitGuestSupportRequest({
      user_id: null,
      email: null,
      category: "General",
      description: "Help needed",
    });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php");
  });

  it("test_submitGuestSupportRequest_body_contains_gofor_needhelp", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitGuestSupportRequest({
      user_id: null,
      email: null,
      category: "General",
      description: "Help needed",
    });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.gofor).toBe("needhelp");
  });

  it("test_submitGuestSupportRequest_accepts_null_user_id_for_guest_path", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitGuestSupportRequest({
      user_id: null,
      email: null,
      category: "Billing",
      description: "Charge issue",
    });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.user_id).toBeNull();
  });

  it("test_submitGuestSupportRequest_accepts_string_user_id_for_logged_in_path", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitGuestSupportRequest({
      user_id: "42",
      email: "user@test.com",
      category: "Technical",
      description: "API error",
    });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.user_id).toBe("42");
  });

  it("test_submitGuestSupportRequest_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(
      submitGuestSupportRequest({
        user_id: null,
        email: null,
        category: "General",
        description: "Issue",
      })
    ).rejects.toThrow("needhelp (guest) failed: 500");
  });
});

// ---------------------------------------------------------------------------
// submitROIQuery (new in Sprint 6 — in supportService)
// ---------------------------------------------------------------------------

describe("submitROIQuery", () => {
  it("test_submitROIQuery_sends_POST_to_api_php", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitROIQuery({ email: "lead@test.com", category: "ROI", description: "Interested" });
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php");
  });

  it("test_submitROIQuery_body_contains_gofor_sendquery", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitROIQuery({ email: "lead@test.com", category: "ROI", description: "Interested" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.gofor).toBe("sendquery");
  });

  it("test_submitROIQuery_body_spreads_payload_fields", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitROIQuery({ email: "lead@test.com", category: "ROI", description: "Interested" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.email).toBe("lead@test.com");
    expect(body.category).toBe("ROI");
    expect(body.description).toBe("Interested");
  });

  it("test_submitROIQuery_body_does_not_include_user_id_field", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await submitROIQuery({ email: "lead@test.com", category: "ROI", description: "Interested" });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body).not.toHaveProperty("user_id");
  });

  it("test_submitROIQuery_throws_when_response_not_ok", async () => {
    global.fetch = makeFetchFail(500);
    await expect(
      submitROIQuery({ email: "lead@test.com", category: "ROI", description: "Interested" })
    ).rejects.toThrow("sendquery failed: 500");
  });
});
