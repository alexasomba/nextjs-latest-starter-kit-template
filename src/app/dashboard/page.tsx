import {
  Building,
  Clock,
  Globe,
  MapPin,
  Navigation,
  Server,
} from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initAuth } from "@/auth";
import FileUploadDemo from "@/components/FileUploadDemo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignOutButton from "./SignOutButton"; // Import the client component

export default async function DashboardPage() {
  const authInstance = await initAuth();
  // Fetch session using next/headers per better-auth docs for server components
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/"); // Redirect to home if no session
  }

  // Optional: Plugin endpoints like geolocation/openapi
  // Provide minimal local typings so we don't rely on generated plugin types here
  type GeolocationOK = {
    timezone?: string | null;
    city?: string | null;
    country?: string | null;
    region?: string | null;
    regionCode?: string | null;
    colo?: string | null;
    latitude?: string | null;
    longitude?: string | null;
  };
  type GeolocationResp = { error: string } | GeolocationOK;
  type CloudflareApiExt = {
    getGeolocation?: (arg: { headers: Headers }) => Promise<GeolocationResp>;
    generateOpenAPISchema?: () => Promise<{ openapi: string }>;
  };
  const api = authInstance.api as unknown as CloudflareApiExt;
  const cloudflareGeolocationData: GeolocationResp | null = api.getGeolocation
    ? await api.getGeolocation({ headers: await headers() })
    : null;

  // Narrowing helpers not needed in rendering logic; avoid unused lint warnings

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Powered by better-auth-cloudflare
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="uppercase">
              Session
            </Badge>
            {session.user?.id && (
              <Badge variant="secondary">User ID: {session.user.id}</Badge>
            )}
            {session.user?.email ? (
              <Badge>Email</Badge>
            ) : (
              <Badge variant="outline">Anonymous</Badge>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="user">User Info</TabsTrigger>
            <TabsTrigger value="geolocation">Geolocation</TabsTrigger>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">
                  Welcome,{" "}
                  <span className="font-semibold">
                    {session.user?.name ||
                      session.user?.email ||
                      "Anonymous User"}
                  </span>
                  !
                </p>
                {session.user?.email && (
                  <p className="text-md break-words">
                    <strong>Email:</strong>{" "}
                    <span className="break-all">{session.user.email}</span>
                  </p>
                )}
                {!session.user?.email && (
                  <p className="text-md">
                    <strong>Account Type:</strong> Anonymous
                  </p>
                )}
                {session.user?.id && (
                  <p className="text-md">
                    <strong>User ID:</strong> {session.user.id}
                  </p>
                )}
                <SignOutButton /> {/* Use the client component for sign out */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geolocation" className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <MapPin className="h-5 w-5" />
                  Your Location
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Automatically detected using Cloudflare's global network
                </p>
              </CardHeader>
              <CardContent>
                {cloudflareGeolocationData &&
                  "error" in cloudflareGeolocationData && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                      <div className="text-red-500">⚠️</div>
                      <p className="text-red-700">
                        <strong>Error:</strong>{" "}
                        {cloudflareGeolocationData.error}
                      </p>
                    </div>
                  )}
                {cloudflareGeolocationData &&
                  !("error" in cloudflareGeolocationData) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-2">
                        <Clock className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Timezone</p>
                          <p className="text-gray-600">
                            {cloudflareGeolocationData.timezone || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2">
                        <Building className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">City</p>
                          <p className="text-gray-600">
                            {cloudflareGeolocationData.city || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Country</p>
                          <p className="text-gray-600">
                            {cloudflareGeolocationData.country || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Region</p>
                          <p className="text-gray-600">
                            {cloudflareGeolocationData.region || "Unknown"}
                            {cloudflareGeolocationData.regionCode &&
                              ` (${cloudflareGeolocationData.regionCode})`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2">
                        <Server className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Data Center
                          </p>
                          <p className="text-gray-600">
                            {cloudflareGeolocationData.colo || "Unknown"}
                          </p>
                        </div>
                      </div>

                      {(cloudflareGeolocationData.latitude ||
                        cloudflareGeolocationData.longitude) && (
                        <div className="flex items-center gap-3 p-2">
                          <Navigation className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Coordinates
                            </p>
                            <p className="text-gray-600">
                              {cloudflareGeolocationData.latitude &&
                              cloudflareGeolocationData.longitude
                                ? `${cloudflareGeolocationData.latitude}, ${cloudflareGeolocationData.longitude}`
                                : "Partially available"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <FileUploadDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
