import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import backgroundImage from "@assets/greenphoto.png";

// Extend the schemas with client-side validations
const extendedLoginSchema = loginUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const extendedRegisterSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  email: z.string().email("Invalid email address"),
});

type LoginFormValues = z.infer<typeof extendedLoginSchema>;
type RegisterFormValues = z.infer<typeof extendedRegisterSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // If user is already logged in, redirect to homepage
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Form Section */}
        <div className="w-full lg:w-1/2 p-8">
          {isLogin ? (
            <LoginForm 
              onSubmit={(data) => loginMutation.mutate(data)} 
              isPending={loginMutation.isPending} 
              onToggleView={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm 
              onSubmit={(data) => registerMutation.mutate(data)} 
              isPending={registerMutation.isPending} 
              onToggleView={() => setIsLogin(true)}
            />
          )}
        </div>

        {/* Image Section */}
        <div 
          className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/90 to-blue-500/90"></div>
          <div className="p-12 relative z-10 h-full flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white mb-6 font-[Poppins]">CyberSafe</h2>
            <p className="text-white text-lg mb-8">
              Learn essential cyber hygiene skills through interactive challenges and games.
            </p>
            <ul className="space-y-4 text-white">
              <li className="flex items-center">
                <i className="bx bx-check-circle mr-2 text-xl"></i>
                <span>Identify phishing attempts</span>
              </li>
              <li className="flex items-center">
                <i className="bx bx-check-circle mr-2 text-xl"></i>
                <span>Create strong passwords</span>
              </li>
              <li className="flex items-center">
                <i className="bx bx-check-circle mr-2 text-xl"></i>
                <span>Practice safe online browsing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isPending, onToggleView }: { 
  onSubmit: (data: LoginFormValues) => void, 
  isPending: boolean,
  onToggleView: () => void 
}) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(extendedLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-[Poppins]">CyberSafe</h1>
        <p className="text-gray-500">Learn cyber hygiene through play</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
                <div className="flex justify-end">
                  <Button variant="link" className="p-0 h-auto text-sm" type="button">
                    Forgot password?
                  </Button>
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-600" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Button variant="link" className="p-0 text-blue-500" onClick={onToggleView} type="button">
                Sign Up
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </>
  );
}

function RegisterForm({ onSubmit, isPending, onToggleView }: { 
  onSubmit: (data: RegisterFormValues) => void, 
  isPending: boolean,
  onToggleView: () => void 
}) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(extendedRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      fullname: "",
      gender: "male",
      email: "",
    },
  });

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-[Poppins]">Join CyberSafe</h1>
        <p className="text-gray-500">Create your account to start learning</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">Other</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-600 mt-6" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Button variant="link" className="p-0 text-blue-500" onClick={onToggleView} type="button">
                Sign In
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </>
  );
}
