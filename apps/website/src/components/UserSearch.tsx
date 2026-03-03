"use client";

import { SearchResult, searchUsername, setAuth } from "@/lib/UserSearch";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { SidebarMenuButton } from "./ui/sidebar";
import { Button } from "./ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";

import auth from "../data/auth.json";

export const UserSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordSent, setPasswordSent] = useState(false);
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<SearchResult>([]);
  const [user, setUser] = useState<SearchResult[number] | undefined>(undefined);

  useEffect(() => {
    setAuth(auth, auth.build);
  }, []);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value;
      setTerm(val);

      if (val.length === 0) {
        setOpen(false);
        return;
      }

      if (!user || user.username !== val) {
        if (user && user.username !== val) {
          setUser(undefined);
        }

        searchUsername(val).then((r) => {
          setResult(r);
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

  const preventDefault = (e: Event) => e.preventDefault();

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
                <div
                  className="flex felx-col gap-4 p-4"
                  onClick={() => onSelect(item)}
                >
                  <img
                    src={`https://minesweeper.online/img/flags/${item.country.toLowerCase()}.png`}
                  />
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
              onChange={setPassword}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>
              Please check your in game messages for a password from{" "}
              <a
                href="https://minesweeper.online/player/50609406"
                target="_blank"
              >
                Flotto Bot
              </a>
            </FieldDescription>
          </Field>
          <Button
            className="mt-6"
            disabled={password.length < 6}
            onClick={() => setPasswordSent(false)}
          >
            Sign In
          </Button>
        </>
      ) : (
        <Button disabled={!user} onClick={() => setPasswordSent(true)}>
          Send Password
        </Button>
      )}
    </div>
  );
};
