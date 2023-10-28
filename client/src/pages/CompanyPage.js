import { useParams } from "react-router";
import { getCompanyById } from "../graphql/query";
import { useEffect, useState } from "react";
import JobList from "../components/JobList";

function CompanyPage() {
  const { companyId } = useParams();

  const [companyDetail, setCompanyDetail] = useState(null);

  useEffect(() => {
    const getCompanyByIdParam = async () => {
      const companyData = await getCompanyById(companyId);
      setCompanyDetail(companyData);
    };
    getCompanyByIdParam();
  }, [companyId]);

  return (
    <div>
      <h1 className="title">{companyDetail?.name}</h1>
      <div className="box">{companyDetail?.description}</div>
      <JobList jobs={companyDetail?.jobs} />
    </div>
  );
}

export default CompanyPage;
