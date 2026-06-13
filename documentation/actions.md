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

swal confirm → POST → toast.

**Props:** `url`, `data`, `title`, `message`, `loadingMessage`, `successMessage`, `failMessage`, `tag` (default `button`), `btnClass`.
**Events:** `success` / `failed` / `canceled` (+ `actionSuccessful` / `actionFailed` / `actionCanceled` aliases).

## ShSilentAction

Direct request, no confirm. Same surface as `ShConfirmAction` plus `method` (`GET|POST|PUT|DELETE`) and `disableSuccessMessage`.
