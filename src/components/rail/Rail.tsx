import UnassignedBoard from './UnassignedBoard';
import ProjectsGrid from './ProjectsGrid';
import WeekStats from './WeekStats';
import './Rail.css';

export default function Rail() {
  return (
    <div className="mar-rail">
      <UnassignedBoard />
      <ProjectsGrid />
      <WeekStats />
    </div>
  );
}
