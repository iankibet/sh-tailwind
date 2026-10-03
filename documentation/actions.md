# Actions

[← Back to overview](../README.md)

Action buttons that wrap a request lifecycle — confirm → POST → toast, or a direct request → toast.

## Example

```vue
<ShConfirmAction url="users/9/suspend" title="Suspend user?" message="They lose access immediately" @success="reload">
    Suspend
</ShConfirmAction>

<ShSilentAction url="cache/flush" method="POST" success-message="Cache cleared">Flush cache</ShSilentAction>
```

## ShConfirmAction

swal confirm → POST `data` to `url` → toast. Renders one clickable element (`tag`, default `button`; use `a` inside a table cell) whose default slot is the label, with a spinner while the request runs.

| Prop | Default | |
|---|---|---|
| `url` | — (required) | endpoint |
| `data` | — | POST body |
| `title` / `message` | — | confirm dialog heading / body |
| `loadingMessage` | `'Processing...'` | |
| `successMessage` | `'Action Successful'` | the server's `message`, if any, is shown instead |
| `failMessage` | `'Action failed'` | |
| `tag` | `'button'` | |
| `btnClass` | theme `buttons.link` | |

**Events:** `success(response)`, `failed(reason)`, `canceled()`, plus the aliases `actionSuccessful` / `actionFailed` / `actionCanceled`.

## ShSilentAction

The request runs straight away, with no confirm. Same props as `ShConfirmAction` **minus** `title` / `message`, **plus**:

- `method`: `GET` | `POST` (default) | `PUT` | `DELETE`
- `disableSuccessMessage`: suppress the success toast

**Events:** `success(response)`, `failed(reason)` (+ `actionSuccessful` / `actionFailed`).

Inside `ShTable`, prefer a `url` row action (with `confirm` for the confirm flow) over embedding these components, see [Table](table.md#action-handlers).
