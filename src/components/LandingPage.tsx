import React from 'react';
import {
  BarChart2, Database, LineChart, Table,
  FileSpreadsheet, Wand2, ArrowRight, CheckCircle2,
  Sparkles
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <BarChart2 className="h-8 w-8" />,
    title: "Advanced Analytics",
    description: "Powerful data analysis tools with interactive visualizations and statistical insights.",
  },
  {
    icon: <Database className="h-8 w-8" />,
    title: "Multiple Data Sources",
    description: "Import data from CSV, Excel, SQL databases, and more with seamless integration.",
  },
  {
    icon: <LineChart className="h-8 w-8" />,
    title: "Interactive Visualizations",
    description: "Create beautiful charts and graphs with real-time updates and customization options.",
  },
  {
    icon: <Table className="h-8 w-8" />,
    title: "Data Management",
    description: "Efficiently manage, filter, and transform your data with an intuitive interface.",
  },
  {
    icon: <FileSpreadsheet className="h-8 w-8" />,
    title: "Export & Share",
    description: "Export your analysis in multiple formats and share insights with your team.",
  },
  {
    icon: <Wand2 className="h-8 w-8" />,
    title: "Data Curation",
    description: "Clean and prepare your data with automated tools and smart suggestions.",
  },
];

const benefits = [
  "Easy to use interface with drag-and-drop functionality",
  "Real-time data analysis and visualization updates",
  "Advanced filtering and data transformation tools",
  "Secure data handling and privacy protection",
  "Export capabilities in multiple formats",
  "Collaborative features for team analysis",
];

export const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),theme(colors.gray.900))] opacity-20 animate-pulse" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white dark:bg-gray-800 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 dark:ring-indigo-900/10 animate-wave" />

        <div className="max-w-7xl mx-auto px-6 pt-32 sm:pt-40 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl text-center">
            <div className="flex justify-center mb-8">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 dark:text-gray-300 ring-1 ring-gray-900/10 dark:ring-gray-100/10 hover:ring-gray-900/20 dark:hover:ring-gray-100/20 transition-all duration-300">
                New Features Available <span aria-hidden="true">&rarr;</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl animate-fade-in-up">
              Data Analysis{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Made Simple</span>
                <Sparkles className="absolute -top-8 right-0 h-6 w-6 text-yellow-400 animate-spin-slow" />
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 animate-fade-in-up">
              Transform your data into actionable insights with our powerful yet intuitive data analysis platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={onGetStarted}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 group"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-16">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-12">
              {[
                { label: "Data Sources", value: "10+" },
                { label: "Analysis Tools", value: "25+" },
                { label: "Chart Types", value: "15+" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg group hover:shadow-xl transition-shadow duration-300 animate-fade-in-up"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <dt className="text-base leading-7 text-gray-600 dark:text-gray-300">{stat.label}</dt>
                    <dd className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{stat.value}</dd>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl animate-fade-in-up">
            Everything you need for data analysis
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                  {React.cloneElement(feature.icon as React.ReactElement, {
                    className: 'h-8 w-8 text-indigo-600 dark:text-indigo-400'
                  })}
                </div>
                <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-b from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Benefits</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl animate-fade-in-up">
              Why Choose Our Platform?
            </p>
          </div>
          <div className="mx-auto max-w-2xl lg:max-w-4xl mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
                    <CheckCircle2 className="h-6 w-6 flex-none text-indigo-600 dark:text-indigo-400" />
                    <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl animate-fade-in-up">
              Ready to Transform Your Data?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-100 animate-fade-in-up">
              Start analyzing your data with our powerful platform today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={onGetStarted}
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-sm hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 inline-block transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};