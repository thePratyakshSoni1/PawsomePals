import { cookies, headers } from "next/headers"
import { LoginPage } from "./loginPage"
import { DataBase } from "@/utils/firebase"
import { redirect } from "next/navigation"
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts"

export default async function Page(){
  return <LoginPage />
}