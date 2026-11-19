import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pageName } from "./activityPages.ts";

const q = (s: string) => new URLSearchParams(s);

describe("activity page names", () => {
  it("names the store's pages the way the phone app names its screens", () => {
    assert.equal(pageName("/shop", q("")), "home");
    assert.equal(pageName("/productView", q("id=abc")), "product_details");
    assert.equal(pageName("/checkoutView", q("")), "checkout");
    assert.equal(pageName("/savedItems", q("")), "saved");
  });

  it("tells a search from a category from the plain product list", () => {
    assert.equal(pageName("/product", q("search=rice")), "search");
    assert.equal(pageName("/product", q("q=rice")), "search");
    assert.equal(pageName("/product", q("category=Rice")), "category_products");
    assert.equal(pageName("/product", q("")), "products");
  });

  it("gives an unknown page a safe name", () => {
    assert.equal(pageName("/someNew-page", q("")), "somenew_page");
  });
});
