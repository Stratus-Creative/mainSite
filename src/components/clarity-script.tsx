import { SITE_SETTINGS } from "@/lib/site-settings";

/**
 * Microsoft Clarity — free heatmaps + session replay.
 * Sign up at https://clarity.microsoft.com to get a project ID,
 * then set NEXT_PUBLIC_CLARITY_PROJECT_ID in your env.
 */
export function ClarityScript() {
  const projectId = SITE_SETTINGS.clarityProjectId;
  if (!projectId) return null;

  // Defense-in-depth: refuse to interpolate anything that could break out of
  // the JS string context. Clarity project IDs are short alphanumeric tokens.
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(projectId)) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${projectId}");`,
      }}
    />
  );
}
