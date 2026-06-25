import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Palette, Box, ArrowRight, Star, ShoppingBag } from 'lucide-react';

interface ShoeModel {
  id: string;
  name: string;
  path: string;
  displayName: string;
  description: string;
  price: string;
  category: string;
  colors: string[];
  thumbnail: string;
}

function HomePage() {
  const navigate = useNavigate();
  const [models, setModels] = useState<ShoeModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('/models/models.json');
        if (response.ok) {
          const data = await response.json();
          setModels(data);
        } else {
          setModels([]);
        }
      } catch (error) {
        console.error('Error loading models:', error);
        setModels([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const handleSelectModel = (model: ShoeModel) => {
    navigate(`/customize?model=${encodeURIComponent(model.path)}`);
  };

  const getColorValue = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      'black': '#000000',
      'white': '#FFFFFF',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'gray': '#6B7280',
      'grey': '#6B7280',
      'navy': '#1E3A8A',
      'olive': '#808000',
      'brown': '#8B4513',
    };
    return colorMap[color.toLowerCase()] || '#9CA3AF';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl font-medium">Loading products...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle 3D Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated Gradient Orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              background: i === 0 
                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)'
                : i === 1
                ? 'radial-gradient(circle, rgba(147, 51, 234, 0.3), transparent)'
                : 'radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent)',
              left: `${20 + i * 30}%`,
              top: `${10 + i * 25}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* 3D Perspective Lines */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                style={{
                  width: '100%',
                  top: `${i * 5}%`,
                  left: 0,
                  transform: `perspective(1000px) rotateX(75deg) translateZ(${-i * 50}px)`,
                  transformOrigin: 'center center',
                }}
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">AI-Powered Customization</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Design Your Perfect
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Product Experience
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Customize 3D products with real-time preview. Choose colors, textures, and styles to create your unique design.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                { icon: Palette, text: 'Unlimited Colors' },
                { icon: Zap, text: 'Real-time Preview' },
                { icon: Box, text: '3D Models' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                >
                  <feature.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-white text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {models.length === 0 ? (
          <div className="text-center py-20">
            <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">No Products Available</h2>
            <p className="text-gray-600">Add GLB/GLTF files to public/models/ directory</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore Our Collection
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Select a product to start customizing. Each model can be personalized with colors, textures, and more.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {models.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 30, rotateY: -15 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -12,
                    rotateY: 5,
                    rotateX: -5,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                  onClick={() => handleSelectModel(model)}
                >
                  {/* Image Container with 3D Effect */}
                  <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <motion.div
                      className="absolute inset-0"
                      whileHover={{
                        scale: 1.1,
                        rotateY: 10,
                        rotateX: -5,
                      }}
                      transition={{ duration: 0.5 }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <img
                        src={model.thumbnail}
                        alt={model.displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </motion.div>
                    {/* Fallback Gradient with 3D effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    />
                    
                    {/* 3D Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{
                        transform: 'skewX(-20deg) translateX(-200%)',
                      }}
                      animate={{
                        x: ['-200%', '200%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-md">
                        {model.category}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-semibold text-gray-800">4.8</span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        className="flex items-center gap-2 text-white font-semibold"
                      >
                        <span>Customize Now</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {model.displayName}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {model.description}
                    </p>
                    
                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {model.price}
                      </span>
                    </div>

                    {/* Colors */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Available Colors</p>
                      <div className="flex gap-2">
                        {model.colors.slice(0, 6).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                            style={{ backgroundColor: getColorValue(color) }}
                            title={color}
                          />
                        ))}
                        {model.colors.length > 6 && (
                          <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-medium">+{model.colors.length - 6}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-purple-700"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Start Customizing</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Create Something Unique?</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Start customizing your products today. No design experience needed - just your creativity.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => models.length > 0 && handleSelectModel(models[0])}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
