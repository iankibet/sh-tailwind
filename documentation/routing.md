# Routing — pages as routes

[← Back to overview](../README.md)

`shPages()` is a Vite plugin that turns the files in your pages folder into routes. Adding a screen is adding a file: no route entry to write. It wraps vue-router's own file-based routing (`vue-router/vite`) and fills in this stack's conventions: auth by default, group folders, a title and breadcrumbs per page.

Requires **Vite** and **vue-router 5 or later**. The rest of the library still works with vue-router 4, or with none; only this entry needs 5.

## Setup

```js
// vite.config.js
import vue from '@vitejs/plugin-vue'
import { shPages } from '@iankibetsh/sh-tailwind/vite'

export default defineConfig({
    plugins: [
        shPages(),      // must come before vue()
        vue()
    ]
})
```

```js
// router.js
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

// routes that are not pages
const extraRoutes = [
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes: [...routes, ...extraRoutes]
})

// dev: new, renamed and removed pages update without a reload. The update
// replaces every route, so hand-written ones are added back in the callback.
if (import.meta.hot) {
    handleHotUpdate(router, () => extraRoutes.forEach(route => router.addRoute(route)))
}
```

The pages folder defaults to `resources/js/pages` (Laravel). Elsewhere: `shPages({ pages: 'src/pages' })`.

## Files to routes

| File | Path | Name |
|---|---|---|
| `users/index.vue` | `/users` | `users` |
| `users/[id].vue` | `/users/:id` | `users-id` |
| `users/[id]/edit.vue` | `/users/:id/edit` | `users-id-edit` |
| `notifications/all.vue` | `/notifications/all` | `notifications-all` |
| `index.vue` | `/` | `index` |
| `[...path].vue` | catch-all | `path` |
| `users/components/UserCard.vue` | not a route | |

- `index.vue` must be lowercase. `[name].vue` is a route param called `name`.
- Any other file name becomes the URL segment as written, so name files in lowercase kebab-case.
- `components/` folders are never routes. Keep a feature's own components, and its `.js` files, beside its pages.
- The route name is the URL with dashes, params included by name.
- `users.vue` next to a `users/` folder is a wrapper: it renders `<router-view />` and the folder's pages are its children. If the folder also has `index.vue`, the wrapper is named `users-parent`.

All of vue-router's file conventions apply. See its [file-based routing guide](https://router.vuejs.org/file-based-routing/) for the full list.

## Group folders

A folder in parentheses groups pages without adding to the URL, and flags every page inside it:

```
pages/
  (admin)/users/index.vue      → /users     meta.admin = true
  (guest)/login/index.vue      → /login     meta.guest = true, meta.auth = false
  home/index.vue               → /home
```

`(guest)` is built in as the signed-out group. Any other group sets `meta.<group> = true`; what that means is up to your navigation guard. Give a group its own meta with the `groups` option:

```js
shPages({ groups: { staff: { role: 'staff' } } })
```

## Default meta

Every page gets:

| Key | Default |
|---|---|
| `auth` | `true` (`false` under `(guest)/`) |
| group flags | one per group folder the page is in |
| `title` | the last named URL segment: `/access-logs` → `Access logs`. A record page takes its list's: `/users/:id` → `Users` |
| `breadcrumbs` | the named segments above the page, as `{ label, to? }`. `to` is set when a page exists at that URL. Omitted when there are none |

Params and the `tab` segment are left out of titles and breadcrumbs. For `/settings/core/tab/messages/:slug`:

```js
{
    auth: true,
    title: 'Messages',
    breadcrumbs: [
        { label: 'Settings' },                                       // no page at /settings
        { label: 'Core', to: '/settings/core' },
        { label: 'Messages', to: '/settings/core/tab/messages' }
    ]
}
```

The plugin only sets meta. Enforcing it is your guard's job:

```js
router.beforeEach((to) => {
    const signedIn = getAuthStrategy().isAuthenticated()
    if (to.meta.guest) return signedIn ? '/' : true
    if (to.meta.auth && !signedIn) return { name: 'login', query: { redirect: to.fullPath } }
    return true
})
```

## Overriding in a page

`definePage()` is a vue-router compiler macro, available in every page without an import:

```vue
<script setup>
import { appName } from '@/lib/app'

definePage({
    meta: {
        title: 'Department permissions',
        heading: { title: `Join ${appName}` }
    }
})
</script>
```

- A key you set replaces the default whole. `breadcrumbs: []` removes the trail.
- **Shorthand:** any key that is not a route option (`name`, `path`, `alias`, `redirect`, `meta`, `props`, `params`, `beforeEnter`) is treated as meta, and a crumb's `href` is read as `to`. These two are the same; an explicit `meta` key wins over a shorthand one:

  ```js
  definePage({ title: 'Administrators', description: 'Accounts and departments.', breadcrumbs: [{ label: 'Dashboard', href: '/' }] })
  definePage({ meta: { title: 'Administrators', description: 'Accounts and departments.', breadcrumbs: [{ label: 'Dashboard', to: '/' }] } })
  ```

  Only `auth`, `title`, `breadcrumbs` and group flags have defaults. Other keys such as `description` are yours to render from `route.meta`.
- Imports can be used inside it. Variables declared in the component cannot: it is lifted out of the component at build time.
- It also takes `name`, `path`, `alias` and `redirect`.

## Tabs

[`ShTabs` router mode](tabs.md#router-mode) links to `/{base}/tab/{key}`, so a tabbed page is a wrapper file plus a `tab/` folder:

```
settings/core.vue                         → /settings/core   (renders <ShTabs base-url="/settings/core" />)
settings/core/tab/messages/index.vue      → /settings/core/tab/messages
settings/core/tab/messages/[slug].vue     → /settings/core/tab/messages/:slug
```

Change the segment that is skipped in titles and breadcrumbs with `tabSegment`.

## Popup pages

A page under a wrapper can open as a [route popup](popups.md#route-popups):

```
tasks.vue                   → /tasks            (no <router-view /> inside)
tasks/[id]/view.vue         → /tasks/:id/view   definePage({ meta: { popup: 'drawer' } })
```

## Static or lazy pages

Pages are imported statically by default: one bundle, instant navigation. To code-split:

```js
shPages({ importMode: 'async' })                                              // every page
shPages({ importMode: (file) => file.includes('/reports/') ? 'async' : 'sync' })  // some
```

## Options

| Option | Default | |
|---|---|---|
| `pages` | `'resources/js/pages'` | folder(s) to scan (vue-router's `routesFolder`) |
| `exclude` | `[]` | extra globs to skip; `**/components/**` is always skipped |
| `meta` | `{ auth: true }` | meta for every page |
| `groups` | `{}` | meta per group folder, merged over the built-in `guest` |
| `tabSegment` | `'tab'` | URL segment left out of titles and breadcrumbs |
| `importMode` | `'sync'` | `'async'`, or a function of the file path |
| `dts` | `false` | `true` or a path writes typed route names (`typed-router.d.ts`) |
| `getRouteName` | dashed URL | replace the naming rule |
| `beforeWriteFiles` | | runs after the defaults are applied |

Every other [vue-router plugin option](https://router.vuejs.org/file-based-routing/) passes through.

## Moving an existing app over

Generated and hand-written routes can share a router, so pages can move one feature at a time:

1. Add `shPages({ exclude: [...] })` listing the page files that still have hand-written routes, so they are not picked up twice.
2. Spread `routes` into `createRouter` next to your own.
3. Per feature: rename its files (`UsersIndex.vue` → `users/index.vue`, `UserShow.vue` → `users/[id].vue`), delete its route entries, drop it from `exclude`.

URLs don't change. Route names do, unless a page keeps its old one with `definePage({ name: 'user' })`.

## Using the rules on their own

```js
import { pageMeta, routeName, createPageDefaults, liftPageMeta } from '@iankibetsh/sh-tailwind/vite'

pageMeta('/users/:id', 'pages/(admin)/users/[id].vue', new Set(['/users']), { meta: { auth: true } })
// { auth: true, admin: true, title: 'Users', breadcrumbs: [{ label: 'Users', to: '/users' }] }
```

`routeName` is the `getRouteName` function, and `createPageDefaults(conventions)` returns the `beforeWriteFiles` step, for use with `vue-router/vite` directly. `liftPageMeta(page)` is the shorthand rule.
