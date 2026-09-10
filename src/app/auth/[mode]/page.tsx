"use client";

import { Layout } from "@/components/app";
import { signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Page() {
  const params = useParams<{ mode: string }>();
  const router = useRouter();
  const login = params.mode === "login";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    try {
      if (!login) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"), email, password, phone: data.get("phone"),
            isAdultConfirmed: data.get("adult") === "on",
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Не удалось создать аккаунт.");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Неверный email или пароль.");
      router.push("/profile");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Что-то пошло не так.");
    } finally {
      setPending(false);
    }
  }

  return <Layout><section className="auth"><p className="eyebrow">SwapPoint · Астрахань</p><h1>{login ? "С возвращением" : "Создайте аккаунт"}</h1><p>{login ? "Войдите, чтобы продолжить обмениваться." : "Только для совершеннолетних пользователей. После регистрации подтвердите email и номер телефона."}</p><form onSubmit={submit}>{!login && <><input name="name" placeholder="Ваше имя" minLength={2} required/><input name="phone" type="tel" placeholder="Номер телефона" required/><label className="consent"><input name="adult" type="checkbox" required/> Мне уже исполнилось 18 лет</label></>}<input name="email" type="email" placeholder="Email" required/><input name="password" type="password" placeholder="Пароль не менее 8 символов" minLength={8} required/>{error && <p className="form-error">{error}</p>}<button className="btn" disabled={pending}>{pending ? "Подождите…" : login ? "Войти" : "Зарегистрироваться"}</button></form><p>{login ? "Нет аккаунта? " : "Уже есть аккаунт? "}<a href={login ? "/auth/register" : "/auth/login"}>{login ? "Регистрация" : "Войти"}</a></p></section></Layout>;
}
