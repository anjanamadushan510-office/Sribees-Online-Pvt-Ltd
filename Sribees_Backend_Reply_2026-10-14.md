# Backend Requirements — පිළිතුර (2026-10-14)

ඔයා එවපු requirements හතරම backend එකේ හැදුවා. මේ හැම වෙනසක්ම **development server** (`https://devapionline.sribees.com/api/v1`) එකේ තියෙන්නේ. Production එකට ඊළඟ release එකේදී යයි. මේ එක්කම එවන `WEB_STOREFRONT_API.md` එකේ 7.1, 7.2, 7.3, 7.5 කොටස් update කරලා තියෙනවා.

Response shapes වෙනස් වුණේ නෑ. තියෙන fields එහෙමම තියෙනවා, අලුත් fields සහ parameters විතරයි එකතු වුණේ. ඒ නිසා දැනට ලියපු code එක කැඩෙන්නේ නෑ.

---

## 1. Banner — `description`

`GET /banners` එකේ හැම banner එකකටම දැන් `description` field එකක් තියෙනවා.

```json
{
  "bannerId": "b0000000-0000-4000-a000-000000000001",
  "title": "Fresh Farm Produce",
  "subtitle": "Delivered straight to you.",
  "description": "Picked this morning from growers in Nuwara Eliya.",
  "imageUrl": "https://devapionline.sribees.com/uploads/banners/....jpg",
  "linkType": "category",
  "targetId": "c1000000-0000-4000-a000-000000000001"
}
```

| Field | දිග | සටහන |
|---|---|---|
| `title` | අකුරු 120 | හැමදාම තියෙනවා |
| `subtitle` | අකුරු 200 | `null` වෙන්න පුළුවන් |
| `description` | අකුරු 300 | **Optional**, `null` වෙන්න පුළුවන් |
| `imageUrl` | — | `null` වෙන්න පුළුවන් |

- Description එක admin panel එකේ banner form එකෙන් ඇතුළත් කරනවා. Mobile app එක ඒක පෙන්නන්නේ නෑ, ඒ නිසා හැම banner එකකම ඒක පුරවලා තියෙයි කියලා හිතන්න එපා. `null` නම් ඒ කොටස පෙන්නන්න එපා.
- Banner එක හිස් වගේ පේන්න ප්‍රධානම හේතුව dev server එකේ banners වලට images නැති එක (`imageUrl: null`). දැන් dev server එකේ banners 8ටම images (1600×600) සහ descriptions දාලා තියෙනවා. ඒත් production එකේ `imageUrl` එක `null` වෙන්න පුළුවන්. එහෙම වුණොත් text එක පිටිපස්සෙන් colour එකක් හරි gradient එකක් හරි පෙන්නන්න.

---

## 2. Filter Option — Categories, Customer Ratings, Promotions

ඔක්කොම filters වැඩ කරන්නේ `GET /products` එකෙන්. ඒවා එකට combine වෙනවා (AND), `search` එකත් එක්කත් වැඩ කරනවා. Pagination එක කලින් වගේමයි.

| Filter | Parameter | වැඩ කරන විදිය |
|---|---|---|
| Categories | `category_id=<id>,<id>` | Categories කීපයක් comma වලින් වෙන් කරලා යවන්න පුළුවන්. ඒ කීපයෙන් **ඕනෑම එකක** තියෙන products එනවා (sub-categories වල ඒවත් එක්ක). එක id එකක් යැව්වත් කලින් වගේම වැඩ කරනවා |
| Customer Ratings | `min_rating=4` | Approved reviews වල average එක තරු 4 හෝ ඊට වැඩි products. UI එකේ "★ 4 & up", "★ 3 & up", "★ 2 & up", "★ 1 & up" කියලා පෙන්නන්න (Daraz/Amazon විදියට). Reviews නැති products මේ filter එකට එන්නේ නෑ |
| Promotions | `promotion=sale` | Branch එකේ sale එකේ තියෙන products (home page එකේ Quick Sale එකේ තියෙන ඒවාමයි) |
| | `promotion=cashback` | සාමාන්‍ය cashback rate එකට වඩා වැඩි cashback තියෙන products |
| | `promotion=sale&promotion=cashback` | ඒ දෙකෙන් එකක් හරි තියෙන products |
| Price | `min_price`, `max_price` | කලින් වගේමයි |

**Sort by rating:** `sort_by=rating&sort_order=desc`. Reviews නැති products අන්තිමට එනවා, `sort_order` එක මොකක් වුණත්.

උදාහරණයක්:

```http
GET /products?category_id=c1000000-0000-4000-a000-000000000001,c1000000-0000-4000-a000-000000000002&min_rating=4&promotion=sale&sort_by=rating&sort_order=desc&page=1&limit=20
```

- `promotion` එකට වෙන value එකක් යැව්වොත් `422` එකක් එනවා.
- **List වල තරු දැන් පේනවා:** කලින් list response වල `average_rating` සහ `review_count` හැමදාම `0` ආවා. දැන් හැම list එකකම (`/products`, `/products/search`, `/products/featured`, `/products/home-feed`, `/products/category/{id}`, `/products/popular`) product card එකේ ඇත්ත අගය එනවා. Reviews නැති product එකකට තවමත් `0` තමයි එන්නේ.

---

## 3. Category `product_count` — හැමදාම 1 ආපු එක

මේක backend එකේ bug එකක්. Query එක products ගණන් කරනවා වෙනුවට join condition එකක් ගණන් කළා, ඒ නිසා හැම category එකකටම `1` ආවා. දැන් fix කළා.

දැන් `product_count` කියන්නේ **customer ට දැන් මිලදී ගන්න පුළුවන් products ගණන**:

- Customer ගේ branch එකේ active සහ stock තියෙන products විතරයි ගණන් වෙන්නේ.
- Sub-category එකක තියෙන products parent category එකේ ගණනටත් එකතු වෙනවා.
- ඒ නිසා tile එකේ පෙන්නන ගණනයි, `GET /products?category_id=<ඒ id එක>` එකේ `pagination.total` එකයි සමානයි.
- Location එකක් තෝරලා නැත්නම් සියලුම active products ගණන් වෙනවා.
- `?hierarchical=true` එකෙන් එන tree එකේ nodes වලටත් දැන් හරි count එක එනවා (කලින් `0` ආවා).

Request එක වෙනස් වෙන්නේ නෑ: `GET /categories`

---

## 4. Popular Picks — වැඩිපුරම විකිණෙන products

අලුත් endpoint එකක්:

```http
GET /products/popular
```

Response:

```json
{
  "success": true,
  "data": {
    "products": [ { "…": "Product object (images එක්ක)" } ],
    "branch": { "branchId": "…", "branchName": "…" },
    "total": 10
  }
}
```

- **උපරිම products 10යි.** `limit` යවන්නේ නැත්නම් default එක 10. `limit=11` හරි ඊට වැඩි හරි යැව්වොත් `422` එකක් එනවා.
- පසුගිය **දින 30** ඇතුළත විකිණුණු units ගණන අනුව, වැඩිපුරම විකිණුණු එක මුලින්ම එනවා. Cancelled, payment නොකළ, return කළ, refund කළ orders ගණන් වෙන්නේ නෑ.
- Sales ගණන් කරන්නේ සියලු branches එකතු කරලා. හැබැයි පෙන්නන්නේ customer ගේ branch එකේ stock තියෙන products විතරයි.
- දින 30 ඇතුළත විකිණුණු products 10කට අඩු නම්, ඉතිරි තැන් පුරවන්නේ **Featured** products වලින්, ඊට පස්සේ **වැඩිපුරම බලපු** products වලින්. ඒ නිසා branch එකේ stock තියෙනවා නම් section එක හිස් වෙන්නේ නෑ. ඒත් branch එකේ products 10කට අඩු නම් 10කට අඩු ගණනක් එන්න පුළුවන්. ඒ නිසා `total` එක check කරන්න.
- Image එක ඕනෙ කියලා කිව්වා. Product object එකේ `images` array එක තියෙනවා, `is_primary: true` තියෙන එක පාවිච්චි කරන්න.
- Sales ගණන් response එකේ එන්නේ නෑ (business data නිසා). Rank එක තියෙන්නේ array order එකේ.
- අනිත් catalog calls වගේම මේකටත් branch context එක ඕනෙ. Location එකක් තෝරලා නැත්නම් `400 NO_BRANCH_CONTEXT` එනවා. Guests ලා `X-Device-Id` header එක යවන්න.

---

## සාරාංශය

| # | ඉල්ලීම | Endpoint | තත්ත්වය |
|---|---|---|---|
| 1 | Banner description | `GET /banners` → `description` | ✅ Dev |
| 2 | Filters (categories / ratings / promotions) | `GET /products?category_id=a,b&min_rating=4&promotion=sale` | ✅ Dev |
| 3 | Category product count | `GET /categories` → `product_count` | ✅ Bug fixed, Dev |
| 4 | Popular Picks (max 10, images එක්ක) | `GET /products/popular` | ✅ Dev |

ප්‍රශ්න තියෙනවා නම් අහන්න.
