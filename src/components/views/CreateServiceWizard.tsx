import React, { useState } from 'react';
import { 
  FolderKanban, 
  Github, 
  Container, 
  Upload, 
  Code2, 
  Globe2, 
  Terminal, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/api';
import { SourceType, RuntimeType, Region } from '../../types/cloudforge';

interface CreateServiceWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const CreateServiceWizard: React.FC<CreateServiceWizardProps> = ({ onComplete, onCancel }) => {
  const { selectedProject, projects, providerInfo, refreshServices } = useProject();

  const [step, setStep] = useState<number>(1);
  const [projectId, setProjectId] = useState<string>(selectedProject?.id || projects[0]?.id || '');
  
  // Step 1: Source
  const [sourceType, setSourceType] = useState<SourceType>('github');
  const [sourceUrl, setSourceUrl] = useState<string>('https://github.com/cloudforge/node-express-template');

  // Step 2: Runtime
  const [runtime, setRuntime] = useState<RuntimeType>('node');

  // Step 3: Configure
  const [serviceName, setServiceName] = useState<string>('my-app-service');
  const [branch, setBranch] = useState<string>('main');
  const [buildCommand, setBuildCommand] = useState<string>('npm run build');
  const [startCommand, setStartCommand] = useState<string>('npm start');
  const [port, setPort] = useState<number>(3000);
  const [region, setRegion] = useState<Region>('North America');

  // Step 4: Environment Variables
  const [envVars, setEnvVars] = useState<{ key: string; value: string; is_secret: boolean }[]>([
    { key: 'NODE_ENV', value: 'production', is_secret: false },
    { key: 'PORT', value: '3000', is_secret: false }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '', is_secret: true }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, field: 'key' | 'value' | 'is_secret', val: any) => {
    const copy = [...envVars];
    copy[index] = { ...copy[index], [field]: val };
    setEnvVars(copy);
  };

  const handleDeployService = async () => {
    if (!projectId) {
      setError('Please select or create a project first.');
      return;
    }
    if (!serviceName.trim()) {
      setError('Service name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create service
      const createdService = await api.createService({
        project_id: projectId,
        name: serviceName.trim().toLowerCase().replace(/\s+/g, '-'),
        source_type: sourceType,
        source_url: sourceUrl,
        runtime,
        branch,
        build_command: buildCommand,
        start_command: startCommand,
        port: Number(port),
        region,
        env_vars: envVars.filter(e => e.key.trim().length > 0)
      });

      // 2. Trigger deploy with provider engine
      await api.deployService(createdService.id);
      await refreshServices();
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize service deployment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-zinc-100">
      {/* Wizard Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Service</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Deploy Node.js, Docker, Python, or Static apps directly to CloudForge infrastructure.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800"
        >
          Cancel
        </button>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {[
          { num: 1, label: 'Choose Source' },
          { num: 2, label: 'Choose Runtime' },
          { num: 3, label: 'Configure' },
          { num: 4, label: 'Env Variables' },
          { num: 5, label: 'Deploy' }
        ].map(s => {
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div 
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex flex-col p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                isCurrent 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                  : isDone 
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-300' 
                    : 'bg-zinc-950 border-zinc-850 text-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between font-mono mb-1">
                <span>Step 0{s.num}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="font-medium truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Provider Status Alert */}
      {!providerInfo?.connected && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-semibold">Deployment Provider Disconnected</p>
            <p className="text-zinc-400 mt-0.5">
              Service record will be created, but deployment status will display <code className="text-amber-400 font-mono">provider_not_connected</code> until an API key is connected in Settings.
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: CHOOSE SOURCE */}
      {step === 1 && (
        <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-xl">
          <h2 className="text-base font-semibold text-zinc-200">Step 1: Choose Source</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => {
                setSourceType('github');
                setSourceUrl('https://github.com/cloudforge/node-express-template');
              }}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                sourceType === 'github' 
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <Github className="w-6 h-6" />
              <div>
                <p className="font-semibold text-sm text-zinc-100">GitHub Repository</p>
                <p className="text-xs text-zinc-500 mt-1">Deploy from public or connected GitHub repo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType('docker');
                setSourceUrl('docker.io/library/nginx:latest');
                setRuntime('docker');
              }}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                sourceType === 'docker' 
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <Container className="w-6 h-6" />
              <div>
                <p className="font-semibold text-sm text-zinc-100">Docker Image</p>
                <p className="text-xs text-zinc-500 mt-1">Pull image from Docker Hub / GitHub Container Registry</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType('upload');
                setSourceUrl('s3://cloudforge-sources/app-archive.zip');
              }}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                sourceType === 'upload' 
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <Upload className="w-6 h-6" />
              <div>
                <p className="font-semibold text-sm text-zinc-100">Upload Source</p>
                <p className="text-xs text-zinc-500 mt-1">Upload code zip file directly to build engine</p>
              </div>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              {sourceType === 'github' ? 'GitHub Repository URL' : sourceType === 'docker' ? 'Docker Image Identifier' : 'Source Archive Path'}
            </label>
            <input
              type="text"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-2"
            >
              <span>Next: Runtime</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE RUNTIME */}
      {step === 2 && (
        <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-xl">
          <h2 className="text-base font-semibold text-zinc-200">Step 2: Choose Runtime</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'node', label: 'Node.js', desc: 'Express, Next.js, NestJS', icon: Code2 },
              { id: 'docker', label: 'Docker', desc: 'Dockerfile build', icon: Container },
              { id: 'python', label: 'Python', desc: 'FastAPI, Django, Flask', icon: Terminal },
              { id: 'static', label: 'Static Website', desc: 'HTML, React SPA, Vite', icon: Globe2 },
            ].map(r => {
              const Icon = r.icon;
              const isSelected = runtime === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRuntime(r.id as RuntimeType);
                    if (r.id === 'static') {
                      setBuildCommand('npm run build');
                      setStartCommand('');
                      setPort(80);
                    } else if (r.id === 'python') {
                      setBuildCommand('pip install -r requirements.txt');
                      setStartCommand('uvicorn main:app --host 0.0.0.0 --port 8000');
                      setPort(8000);
                    } else if (r.id === 'node') {
                      setBuildCommand('npm run build');
                      setStartCommand('npm start');
                      setPort(3000);
                    }
                  }}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <div>
                    <p className="font-semibold text-sm text-zinc-100">{r.label}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-2"
            >
              <span>Next: Configuration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIGURE */}
      {step === 3 && (
        <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-xl">
          <h2 className="text-base font-semibold text-zinc-200">Step 3: Service Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Target Project</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.region})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Service Name</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                placeholder="my-api-service"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Git Branch</label>
              <input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Internal HTTP Port</label>
              <input
                type="number"
                value={port}
                onChange={e => setPort(Number(e.target.value))}
                placeholder="3000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Build Command</label>
              <input
                type="text"
                value={buildCommand}
                onChange={e => setBuildCommand(e.target.value)}
                placeholder="npm run build"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Start Command</label>
              <input
                type="text"
                value={startCommand}
                onChange={e => setStartCommand(e.target.value)}
                placeholder="npm start"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">Region</label>
              <div className="grid grid-cols-3 gap-3">
                {(['Europe', 'North America', 'Asia'] as Region[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      region === r
                        ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-2"
            >
              <span>Next: Environment Variables</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ENVIRONMENT VARIABLES */}
      {step === 4 && (
        <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-200">Step 4: Environment Variables</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Secrets are encrypted and never exposed in logs or frontend responses.</p>
            </div>
            <button
              type="button"
              onClick={addEnvVar}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-medium rounded-lg flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable</span>
            </button>
          </div>

          <div className="space-y-3">
            {envVars.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">No environment variables added.</p>
            ) : (
              envVars.map((ev, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="KEY (e.g. DATABASE_URL)"
                    value={ev.key}
                    onChange={e => updateEnvVar(index, 'key', e.target.value.toUpperCase())}
                    className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type={ev.is_secret ? 'password' : 'text'}
                    placeholder="VALUE"
                    value={ev.value}
                    onChange={e => updateEnvVar(index, 'value', e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => updateEnvVar(index, 'is_secret', !ev.is_secret)}
                    className={`p-2 rounded-lg border text-xs transition-colors ${
                      ev.is_secret ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                    }`}
                    title={ev.is_secret ? 'Secret (Masked)' : 'Plaintext'}
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEnvVar(index)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-2"
            >
              <span>Next: Review & Deploy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: DEPLOY */}
      {step === 5 && (
        <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-xl">
          <h2 className="text-base font-semibold text-zinc-200">Step 5: Review & Deploy</h2>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <div>
              <span className="text-zinc-500">Service Name:</span>
              <p className="text-emerald-400 font-bold mt-0.5">{serviceName}</p>
            </div>
            <div>
              <span className="text-zinc-500">Runtime:</span>
              <p className="text-zinc-200 mt-0.5">{runtime.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-zinc-500">Source:</span>
              <p className="text-zinc-200 mt-0.5 truncate">{sourceUrl}</p>
            </div>
            <div>
              <span className="text-zinc-500">Region & Port:</span>
              <p className="text-zinc-200 mt-0.5">{region} (Port {port})</p>
            </div>
            <div>
              <span className="text-zinc-500">Build Command:</span>
              <p className="text-zinc-300 mt-0.5">{buildCommand || 'None'}</p>
            </div>
            <div>
              <span className="text-zinc-500">Start Command:</span>
              <p className="text-zinc-300 mt-0.5">{startCommand || 'None'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-400">Ready to provision CloudForge service</p>
              <p className="text-zinc-400 mt-0.5">
                Clicking "Deploy Service" will register the service with the backend API and send the build dispatch to the active deployment provider engine.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              id="deploy-service-final-btn"
              onClick={handleDeployService}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-zinc-950" />
              <span>{loading ? 'Dispatching Deployment...' : 'Deploy Service'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
