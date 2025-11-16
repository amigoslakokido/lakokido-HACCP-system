import { useState } from 'react';
import { Sparkles, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SmartInputProps {
  section: 'deviation' | 'incident' | 'first-aid' | 'fire' | 'maintenance' | 'environment';
  onAnalysisComplete: (analysis: any) => void;
  placeholder?: string;
}

export function SmartInput({ section, onAnalysisComplete, placeholder }: SmartInputProps) {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setAnalyzing(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-assistant`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, section })
      });

      if (res.ok) {
        const result = await res.json();
        setAnalysis(result);
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Feil ved analyse:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSectionLabel = () => {
    switch (section) {
      case 'deviation': return 'Avvik';
      case 'incident': return 'Hendelse';
      case 'first-aid': return 'Førstehjelp';
      case 'fire': return 'Brann';
      case 'maintenance': return 'Vedlikehold';
      case 'environment': return 'Miljø';
      default: return 'HMS';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Smart Assistent</h3>
          <p className="text-sm text-gray-600">Beskriv situasjonen, så hjelper systemet deg</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hva har skjedd? ({getSectionLabel()})
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder || `Eksempel: "Førstehjelpsskap mangler plaster og bandasjer"\n\nSkriv fritt, systemet vil analysere og foreslå løsninger.`}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            disabled={analyzing}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!text.trim() || analyzing}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyserer...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyser og få forslag
            </>
          )}
        </button>

        {analysis && (
          <div className="mt-6 space-y-4 animate-fadeIn">
            {analysis.category && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Kategori identifisert</p>
                    <p className="text-sm text-gray-600 mt-1">{analysis.category}</p>
                  </div>
                </div>
              </div>
            )}

            {analysis.severity && (
              <div className={`rounded-lg p-4 border-l-4 ${
                analysis.severity === 'Kritisk' ? 'bg-red-50 border-red-600' :
                analysis.severity === 'Høy' ? 'bg-orange-50 border-orange-600' :
                analysis.severity === 'Middels' ? 'bg-yellow-50 border-yellow-600' :
                'bg-green-50 border-green-600'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${
                    analysis.severity === 'Kritisk' ? 'text-red-600' :
                    analysis.severity === 'Høy' ? 'text-orange-600' :
                    analysis.severity === 'Middels' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <div>
                    <p className="font-semibold text-gray-900">Alvorlighetsgrad</p>
                    <p className="text-sm text-gray-600 mt-1">{analysis.severity}</p>
                  </div>
                </div>
              </div>
            )}

            {analysis.detectedIssues && analysis.detectedIssues.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Oppdagede problemer:</p>
                <ul className="space-y-1">
                  {analysis.detectedIssues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.missingItems && analysis.missingItems.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">Manglende materiell:</p>
                <ul className="space-y-1">
                  {analysis.missingItems.map((item: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="font-semibold text-amber-900 mb-2">💡 Forslag til handling:</p>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600 mt-1">→</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="font-semibold text-green-900 mb-2">✓ Anbefalte steg:</p>
                <ol className="space-y-2">
                  {analysis.recommendedActions.map((action: string, index: number) => (
                    <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="font-bold text-green-600">{index + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {analysis.immediateActions && analysis.immediateActions.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-300">
                <p className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  ⚠️ UMIDDELBARE TILTAK:
                </p>
                <ul className="space-y-2">
                  {analysis.immediateActions.map((action: string, index: number) => (
                    <li key={index} className="text-sm font-medium text-red-800 flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
