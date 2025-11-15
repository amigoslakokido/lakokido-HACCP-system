import { useState } from 'react';
import { X, HelpCircle, Loader2, Play } from 'lucide-react';

interface AssistantResponse {
  forslag: string[];
  tiltak: string[];
  kommentarer: string[];
  manglende: string[];
}

interface ExecuteAction {
  action: string;
  label: string;
  data?: any;
}

interface AssistantPanelProps {
  seksjon: string;
  data?: any;
  executeActions?: ExecuteAction[];
  onExecuteSuccess?: () => void;
}

export function AssistantPanel({ seksjon, data = {}, executeActions = [], onExecuteSuccess }: AssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const fetchAssistance = async () => {
    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hms-assistant/${seksjon}`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const result = await res.json();
        setResponse(result);
      }
    } catch (error) {
      console.error('Feil ved henting av assistanse:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!response) {
      fetchAssistance();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleExecute = async (action: string, actionData?: any) => {
    setExecuting(action);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hms-executor/${action}`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(actionData || {})
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          alert(result.message || 'Handling utført. Du kan nå redigere dataene.');
          if (onExecuteSuccess) {
            onExecuteSuccess();
          }
          fetchAssistance();
        }
      }
    } catch (error) {
      console.error('Feil ved utføring av handling:', error);
      alert('Kunne ikke utføre handlingen. Prøv igjen.');
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all hover:shadow-xl"
          title="Åpne assistent"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Assistent</span>
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-[101]"
            onClick={handleClose}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-[102] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Assistent</h2>
                <button
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-blue-100 mt-2 text-sm">
                Systemet gir forslag basert på registrerte opplysninger
              </p>
            </div>

            <div className="p-6 space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}

              {!loading && response && (
                <>
                  {response.manglende && response.manglende.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        Manglende informasjon
                      </h3>
                      <ul className="space-y-2">
                        {response.manglende.map((item, index) => (
                          <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.tiltak && response.tiltak.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
                        Anbefalte tiltak
                      </h3>
                      <ul className="space-y-2">
                        {response.tiltak.map((item, index) => (
                          <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.forslag && response.forslag.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Systemet foreslår følgende
                      </h3>
                      <ul className="space-y-2">
                        {response.forslag.map((item, index) => (
                          <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.kommentarer && response.kommentarer.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                        Tilleggsinformasjon
                      </h3>
                      <ul className="space-y-2">
                        {response.kommentarer.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-600 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {executeActions.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-600" />
                        Hurtighandlinger
                      </h3>
                      <p className="text-xs text-green-700 mb-3">
                        Systemet kan opprette manglende poster med standardverdier.
                        Alt som opprettes kan redigeres etterpå.
                      </p>
                      <div className="space-y-2">
                        {executeActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleExecute(action.action, action.data)}
                            disabled={executing === action.action}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                          >
                            {executing === action.action ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Oppretter...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                {action.label}
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-green-600 mt-3 italic">
                        ✓ Alle verdier kan endres etter opprettelse
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <button
                      onClick={fetchAssistance}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Oppdater veiledning
                    </button>
                  </div>
                </>
              )}

              {!loading && !response && (
                <div className="text-center py-12 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Klikk for å få veiledning basert på registrerte data</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
