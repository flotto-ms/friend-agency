"use client";

import { SearchResult, searchUsername, setAuth } from "@/lib/UserSearch";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { SidebarMenuButton } from "./ui/sidebar";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp";
import { tokenDecode } from "@/lib/jwtdecode";
import { useAppDispatch } from "@/data/hooks";
import { setToken } from "@/data/authSlice";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

export const UserSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordSent, setPasswordSent] = useState(false);
  const [signedOut, setSignedOut] = useState(true);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [term, setTerm] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [result, setResult] = useState<SearchResult>([]);
  const [user, setUser] = useState<SearchResult[number] | undefined>(undefined);
  const [disabled, setDisabled] = useState(false);

  const dispatch = useAppDispatch();

  const ref = useRef(term);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const sessionToken = sessionStorage.getItem("token");
    if (sessionToken) {
      setSignedOut(false);
    }
  });

  useEffect(() => {
    fetch("/api/auth").then((r) => {
      const token = r.headers.get("X-FlottoToken");
      if (!token) {
        return;
      }
      setAuthToken(token);
      const auth = tokenDecode(token);
      setAuth(auth, auth.build);
    });
  }, []);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value;
      ref.current = val;
      setTerm(val);

      if (val.length === 0) {
        setOpen(false);
        return;
      }

      if (!user || user.username !== val) {
        if (user && user.username !== val) {
          setUser(undefined);
        }

        searchUsername(val)
          .then((r) => {
            if (val !== ref.current) {
              return;
            }
            setResult(r);
            if (!r) {
              setOpen(false);
              return;
            }
            if (!r) {
              setOpen(false);
              return;
            }
            if (r.length === 1 && r[0].username === val) {
              setUser(r[0]);
            } else if (r.length > 0) {
              setOpen(true);
              return;
            }
            setOpen(false);
          })
          .catch(() => {
            //Do Nothing
          });
      }
    },
    [user],
  );

  const onSelect = useCallback((user: SearchResult[number]) => {
    setUser(user);
    setTerm(user.username);
    setOpen(false);
  }, []);

  const onSendPassword = useCallback(() => {
    if (!user) {
      return;
    }
    setDisabled(true);
    fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((r) => r.json())
      .then(() => setPasswordSent(true))
      .finally(() => setDisabled(false));
  }, [authToken, user]);

  const onSignIn = useCallback(() => {
    if (!user || !password) {
      return;
    }

    setPasswordInvalid(false);
    setDisabled(true);

    fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, password: `${password.substring(0, 3)}-${password.substring(3, 6)}` }),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then(async (r) => {
        return {
          status: r.status,
          data: await r.json(),
        };
      })
      .then((r) => {
        if (r.status === 200) {
          dispatch(setToken(r.data.token));
          setPasswordSent(false);
          setSignedOut(false);
          return;
        }

        if (r.data.message === "Invalid Password") {
          setPasswordInvalid(true);
        } else {
          setPasswordSent(false);
        }
      })
      .finally(() => setDisabled(false));
  }, [password, user]);

  const onSignOut = useCallback(() => {
    sessionStorage.removeItem("token");
    setSignedOut(true);
  }, []);

  const preventDefault = (e: Event) => e.preventDefault();

  if (!signedOut) {
    return (
      <div className="flex flex-col gap-2">
        <FieldDescription>You are currently signed it to Flotto.</FieldDescription>
        <Button onClick={onSignOut}>Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
        <Popover open={open && result.length > 0}>
          <PopoverTrigger>
            <Input
              id="input-field-username"
              type="text"
              disabled={passwordSent}
              placeholder="Enter your username"
              onChange={onChange}
              autoComplete="off"
              value={term}
            />
          </PopoverTrigger>
          <PopoverContent
            align="start"
            onOpenAutoFocus={preventDefault}
            onCloseAutoFocus={preventDefault}
            className="flex flex-col gap-1 p-2"
          >
            {result?.map((item) => (
              <SidebarMenuButton variant="outline" asChild key={item.id}>
                <div className="flex felx-col gap-4 p-4" onClick={() => onSelect(item)}>
                  <img src={`https://minesweeper.online/img/flags/${item.country.toLowerCase()}.png`} />
                  <span>{item.username}</span>
                </div>
              </SidebarMenuButton>
            ))}
          </PopoverContent>
        </Popover>
      </Field>
      {passwordSent ? (
        <>
          <Field>
            <FieldLabel htmlFor="input-field-username">Password</FieldLabel>
            <InputOTP
              autoFocus
              maxLength={6}
              value={password}
              type="text"
              inputMode="text"
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              onChange={setPassword}
              pasteTransformer={(pasted) => pasted.trim().replaceAll("-", "")}
            >
              <InputOTPGroup>
                <InputOTPSlot inputMode="text" index={0} />
                <InputOTPSlot inputMode="text" index={1} />
                <InputOTPSlot inputMode="text" index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot inputMode="text" index={3} />
                <InputOTPSlot inputMode="text" index={4} />
                <InputOTPSlot inputMode="text" index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>
              Please check your in game messages for a password from{" "}
              <a href="https://minesweeper.online/player/50609406" target="_blank">
                Flotto Bot
              </a>
            </FieldDescription>
          </Field>
          <Button className="mt-6" disabled={password.length < 6} onClick={onSignIn}>
            Sign In
          </Button>

          {passwordInvalid && <div className="my-2 text-red-500">Invalid Password</div>}
        </>
      ) : (
        <Button disabled={disabled || !user} onClick={onSendPassword}>
          Send Password
        </Button>
      )}
    </div>
  );
};
