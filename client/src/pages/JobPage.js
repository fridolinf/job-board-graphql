import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { formatDate } from "../lib/formatters";
import { useEffect, useState } from "react";
import { getJobById } from "../graphql/query";

function JobPage() {
  const { jobId } = useParams();
  const [jobDetail, setJobDetail] = useState(null);

  useEffect(() => {
    const getJobByIdParam = async () => {
      const jobData = await getJobById(jobId);
      setJobDetail(jobData);
    };
    getJobByIdParam();
  }, [jobId]);

  return (
    <div>
      <h1 className="title is-2">{jobDetail?.title}</h1>
      <h2 className="subtitle is-4">
        <Link to={`/companies/${jobDetail?.company?.id}`}>
          {jobDetail?.company?.name}
        </Link>
      </h2>
      <div className="box">
        <div className="block has-text-grey">Posted: {jobDetail?.date}</div>
        <p className="block">{jobDetail?.description}</p>
      </div>
    </div>
  );
}

export default JobPage;
