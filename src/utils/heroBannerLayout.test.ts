import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bannerHasDestination, heroBannerLayout } from "./heroBannerLayout.ts";

describe("hero banner layout", () => {
  it("shows Shop Now on an artwork-only banner that opens a category", () => {
    assert.deepEqual(heroBannerLayout({ linkType: "category" }), {
      showText: false,
      showShade: false,
      showButton: true,
    });
  });

  it("shows Shop Now on artwork-only Quick Sale and product banners", () => {
    assert.equal(heroBannerLayout({ linkType: "quick_sale" }).showButton, true);
    assert.equal(heroBannerLayout({ linkType: "product" }).showButton, true);
  });

  it("keeps an artwork-only banner with no destination clean", () => {
    assert.deepEqual(heroBannerLayout({ title: "", linkType: null }), {
      showText: false,
      showShade: false,
      showButton: false,
    });
  });

  it("keeps words, shade and button on a banner with words", () => {
    assert.deepEqual(heroBannerLayout({ title: "Avurudu Sale" }), {
      showText: true,
      showShade: true,
      showButton: true,
    });
  });

  it("does not treat an unknown link type as a destination", () => {
    assert.equal(bannerHasDestination("somewhere"), false);
    assert.equal(bannerHasDestination(" Category "), true);
  });
});
