import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button className="w-full">Login</Button>
      </CardContent>
    </Card>
  );
}
