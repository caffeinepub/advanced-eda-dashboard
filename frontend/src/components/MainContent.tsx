import { useData } from '@/context/DataContext';
import FileUpload from '@/components/FileUpload';
import SummaryCards from '@/components/SummaryCards';
import DatasetPreview from '@/components/DatasetPreview';
import DescriptiveStats from '@/components/DescriptiveStats';
import MissingValueHandler from '@/components/MissingValueHandler';
import FilteredDataTable from '@/components/FilteredDataTable';
import VisualizationHub from '@/components/VisualizationHub';

export default function MainContent() {
  const { data } = useData();
  const hasData = data.length > 0;

  return (
    <div className="space-y-6 max-w-full">
      {/* Hero Banner */}
      {!hasData && (
        <div className="relative rounded-xl overflow-hidden">
          <img
            src="/assets/generated/eda-hero-banner.dim_1200x300.png"
            alt="EDA Dashboard Banner"
            className="w-full object-cover h-32 md:h-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent flex items-center px-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">Advanced EDA Dashboard</h2>
              <p className="text-sm text-foreground/80 mt-1">Upload a CSV file to start exploring your data</p>
            </div>
          </div>
        </div>
      )}

      <FileUpload />

      {hasData && (
        <>
          <SummaryCards />
          <MissingValueHandler />
          <DatasetPreview />
          <DescriptiveStats />
          <FilteredDataTable />
          <VisualizationHub />
        </>
      )}
    </div>
  );
}
