export interface JobLink { title: string; job_url: string; }
export interface LgaRow {
  council: string;
  council_id: string;
  state?: string;
  abs_name?: string | null;
  jobs_count: number;
  job_status: string;
  scraped_at?: string;
  jobs: JobLink[];
}
