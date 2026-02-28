export default function Home() {
  return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Projects Platform
      </h1>
      <p className="text-xl text-gray-600 mb-12">Plataforma de gestión multi-proyecto</p>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <a 
          href="/demo-restaurante" 
          className="p-8 border rounded-lg hover:shadow-2xl transition-all bg-white group"
        >
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-600">Web Demo</h2>
          <p className="text-gray-600">Web pública personalizada por proyecto</p>
        </a>
        
        <a 
          href="/dashboard" 
          className="p-8 border rounded-lg hover:shadow-2xl transition-all bg-white group"
        >
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-3xl font-bold mb-4 group-hover:text-green-600">Dashboard</h2>
          <p className="text-gray-600">Gestión de proyectos</p>
        </a>
      </div>
    </div>
  );
}
