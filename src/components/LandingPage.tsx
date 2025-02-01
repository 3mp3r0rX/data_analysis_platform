import React from 'react';
import { 
  BarChart2, 
  Database, 
  LineChart,
  Table, 
  FileSpreadsheet,
  Wand2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <BarChart2 className="h-8 w-8 text-blue-500" />,
    title: "Advanced Analytics",
    description: "Powerful data analysis tools with interactive visualizations and statistical insights."
  },
  {
    icon: <Database className="h-8 w-8 text-green-500" />,
    title: "Multiple Data Sources",
    description: "Import data from CSV, Excel, SQL databases, and more with seamless integration."
  },
  {
    icon: <LineChart className="h-8 w-8 text-purple-500" />,
    title: "Interactive Visualizations",
    description: "Create beautiful charts and graphs with real-time updates and customization options."
  },
  {
    icon: <Table className="h-8 w-8 text-indigo-500" />,
    title: "Data Management",
    description: "Efficiently manage, filter, and transform your data with an intuitive interface."
  },
  {
    icon: <FileSpreadsheet className="h-8 w-8 text-orange-500" />,
    title: "Export & Share",
    description: "Export your analysis in multiple formats and share insights with your team."
  },
  {
    icon: <Wand2 className="h-8 w-8 text-pink-500" />,
    title: "Data Curation",
    description: "Clean and prepare your data with automated tools and smart suggestions."
  }
];

export const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-light-background to-white dark:from-dark-background dark:to-dark-surface">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
            Data Analysis{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto mb-8">
            Transform your data into actionable insights with our powerful yet intuitive data analysis platform.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { label: "Data Sources", value: "10+" },
            { label: "Analysis Tools", value: "25+" },
            { label: "Chart Types", value: "15+" }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white dark:bg-dark-surface shadow-soft-md hover:shadow-soft-xl transition-shadow duration-200"
            >
              <div className="text-3xl font-bold text-light-primary dark:text-dark-primary mb-2">
                {stat.value}
              </div>
              <div className="text-light-text-secondary dark:text-dark-text-secondary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-light-surface dark:bg-dark-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-light-text-primary dark:text-dark-text-primary mb-12">
            Powerful Features for Data Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-dark-surface shadow-soft-md hover:shadow-soft-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-light-text-primary dark:text-dark-text-primary mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "Easy to use interface with drag-and-drop functionality",
              "Real-time data analysis and visualization updates",
              "Advanced filtering and data transformation tools",
              "Secure data handling and privacy protection",
              "Export capabilities in multiple formats",
              "Collaborative features for team analysis"
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4"
              >
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start analyzing your data with our powerful platform today.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};