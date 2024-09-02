import { x } from "../x";
import { signInAction, signOutAction } from "./actions";

export default async function Home() {
  const user = await x.get("auth").auth();
  return (
    <main>
      <h1>Hello Auth.js</h1>
      {user ? (
        <div>
          Welcome {user.user?.email || "Unknown"}!
          <br />
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      ) : (
        <div>
          Not logged in!
          <br />
          <form action={signInAction}>
            <button type="submit">Sign in</button>
          </form>
        </div>
      )}
    </main>
  );
}
