import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, FileText, Calendar, Clock, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateIntelligentReport } from '../Reports/ReportGenerator';

const ADMIN_EMAIL = 'amigoslakokido@gmail.com';
const ADMIN_PASSWORD_KEY = 'admin_password';

export function AdminReportsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const checkPassword = () => {
    const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin123';
    if (password === storedPassword) {
      setIsUnlocked(true);
      setPassword('');
    } else {
      alert('Feil passord!');
    }
  };

  const resetPassword = async () => {
    if (resetEmail !== ADMIN_EMAIL) {
      alert('Ugyldig e-postadresse!');
      return;
    }

    const newPassword = prompt('Skriv inn nytt passord:');
    if (!newPassword || newPassword.length < 4) {
      alert('Passordet må være minst 4 tegn!');
      return;
    }

    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
    alert('Passordet er endret! Bruk det nye passordet for å logge inn.');
    setShowResetForm(false);
    setResetEmail('');
  };

  const generateReport = async (date: string) => {
    try {
      setGenerating(true);
      await generateIntelligentReport({
        date,
        includeViolations: true,
        violationCount: Math.floor(Math.random() * 3) + 1,
      });
      alert('Rapport opprettet!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Feil ved opprettelse av rapport: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const generateBulkReports = async () => {
    if (!bulkStartDate || !bulkEndDate) {
      alert('Vennligst velg både start- og sluttdato');
      return;
    }

    const start = new Date(bulkStartDate);
    const end = new Date(bulkEndDate);

    if (start > end) {
      alert('Startdato må være før sluttdato');
      return;
    }

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      alert('Kan ikke opprette rapporter for mer enn ett år om gangen');
      return;
    }

    const confirmMsg = `Dette vil opprette ${daysDiff + 1} rapporter fra ${bulkStartDate} til ${bulkEndDate}. Fortsette?`;
    if (!confirm(confirmMsg)) return;

    try {
      setGenerating(true);
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];

        const { data: existingReport } = await supabase
          .from('daily_reports')
          .select('id')
          .eq('report_date', dateStr)
          .maybeSingle();

        if (!existingReport) {
          await generateIntelligentReport({
            date: dateStr,
            includeViolations: true,
            violationCount: Math.floor(Math.random() * 3) + 1,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      alert(`${daysDiff + 1} rapporter opprettet!`);
      setBulkStartDate('');
      setBulkEndDate('');
    } catch (error) {
      console.error('Error generating bulk reports:', error);
      alert('Feil ved masseopprettelse: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const triggerScheduledReport = async () => {
    if (!confirm('Vil du kjøre den daglige rapporten nå?')) return;

    try {
      setGenerating(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/scheduled-daily-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('Daglig rapport opprettet!');
      } else {
        throw new Error(result.error || 'Ukjent feil');
      }
    } catch (error) {
      console.error('Error triggering scheduled report:', error);
      alert('Feil ved kjøring av daglig rapport: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-red-600" />
          <span className="font-semibold text-slate-900">Administratorinnstillinger</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-200">
          {!isUnlocked ? (
            <div className="space-y-4 pt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Beskyttet område</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Dette området krever passord for å få tilgang til avanserte rapportfunksjoner.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Passord
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
                    placeholder="Skriv inn passord"
                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={checkPassword}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Lås opp
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200">
                {!showResetForm ? (
                  <button
                    onClick={() => setShowResetForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Glemt passord?
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Skriv inn e-postadresse for å tilbakestille passord
                    </p>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="E-postadresse"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={resetPassword}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Tilbakestill
                      </button>
                      <button
                        onClick={() => {
                          setShowResetForm(false);
                          setResetEmail('');
                        }}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Du har nå tilgang til administratorfunksjonene
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-600" />
                    Opprett ny rapport
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Velg dato
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => generateReport(selectedDate)}
                      disabled={generating}
                      className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      {generating ? 'Oppretter...' : 'Opprett rapport'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    Masseopprett rapporter
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Fra dato
                        </label>
                        <input
                          type="date"
                          value={bulkStartDate}
                          onChange={(e) => setBulkStartDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Til dato
                        </label>
                        <input
                          type="date"
                          value={bulkEndDate}
                          onChange={(e) => setBulkEndDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={generateBulkReports}
                      disabled={generating || !bulkStartDate || !bulkEndDate}
                      className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      {generating ? 'Oppretter...' : 'Masseopprett'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Daglig rapport - Planlegging
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Automatisk generering kjører hver dag kl. 03:00. Du kan også kjøre den manuelt her.
                </p>
                <button
                  onClick={triggerScheduledReport}
                  disabled={generating}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  {generating ? 'Kjører...' : 'Kjør daglig rapport nå'}
                </button>
              </div>

              <button
                onClick={() => {
                  setIsUnlocked(false);
                  setPassword('');
                }}
                className="w-full text-sm text-slate-600 hover:text-slate-900 py-2"
              >
                Lås igjen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
