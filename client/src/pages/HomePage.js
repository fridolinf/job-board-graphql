import { useEffect, useState } from "react";
import JobList from "../components/JobList";
import { getJobs } from "../graphql/query";

function HomePage() {
  const [jobs, setJobs] = useState([]);
  const getJob = async () => {
    const jobList = await getJobs();
    setJobs(jobList);
  };

  useEffect(() => {
    getJob();
  }, []);

  return (
    <div>
      <h1 className="title">Job Board</h1>
      <JobList jobs={jobs} />
    </div>
  );
}

export default HomePage;
