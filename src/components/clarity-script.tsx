import { SITE_SETTINGS } from "@/lib/site-settings";

/**
 * Microsoft Clarity — free heatmaps + session replay.
 * Sign up at https://clarity.microsoft.com to get a project ID,
 * then set NEXT_PUBLIC_CLARITY_PROJECT_ID in your env.
 */
export function ClarityScript() {
  const projectId = SITE_SETTINGS.clarityProjectId;
  if (!projectId) return null;

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
