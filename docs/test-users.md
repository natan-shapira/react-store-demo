# Test users (development only)

> This file is a developer reference. It is **not** part of the application and is not bundled or deployed.

Sign-in is handled by the [DummyJSON auth API](https://dummyjson.com/docs/auth), so only users that exist in DummyJSON can sign in.
The accounts below were verified against `POST https://dummyjson.com/auth/login`.

| Username   | Password       | Name             |
| ---------- | -------------- | ---------------- |
| `emilys`   | `emilyspass`   | Emily Johnson    |
| `michaelw` | `michaelwpass` | Michael Williams |
| `sophiab`  | `sophiabpass`  | Sophia Brown     |

## Notes

- Usernames are case-sensitive (`emilys`, not `Emilys`).
- More users and their passwords: <https://dummyjson.com/users?select=username,password>
- Sign-up is simulated locally (DummyJSON has no real sign-up endpoint). A user created through the sign-up form exists only in the local store and **cannot** sign in again after signing out.
