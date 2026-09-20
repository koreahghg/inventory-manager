"use client";

import { FormEvent } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Alert } from "@/shared/ui/Alert";
import { useToast } from "@/shared/ui/toast";
import { login } from "./actions";

export function LoginForm({ error }: { error?: string }) {
  const showToast = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!email || !password) {
      event.preventDefault();
      showToast("아이디와 비밀번호를 입력해 주세요.");
    }
  }

  return (
    <form
      action={login}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <Field label="아이디" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          size="l"
          placeholder="이메일을 입력해 주세요"
          autoComplete="username"
        />
      </Field>

      <Field label="비밀번호" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          size="l"
          placeholder="비밀번호를 입력해 주세요"
          autoComplete="current-password"
        />
      </Field>

      {error === "rate_limited" && (
        <Alert message="로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요." />
      )}
      {error === "invalid" && (
        <Alert message="아이디 또는 비밀번호가 올바르지 않습니다." />
      )}

      <Button type="submit" size="l" className="mt-2 w-full">
        로그인
      </Button>
    </form>
  );
}
