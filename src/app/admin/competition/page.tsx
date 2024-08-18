import { H2, P } from "@/app/_components/global/text";
import { findCompetitions } from "@/database/competition.query";
import { getServerSession } from "@/lib/next-auth";
import CompetitionTable from "./_components/table";

export default async function Users() {
  const session = await getServerSession();
  const competitions = await findCompetitions({
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <H2 className="font-semibold">Comp list</H2>
          <P>View competitions</P>
        </div>
      </div>
      <CompetitionTable data={competitions} session={session} />
    </div>
  );
}