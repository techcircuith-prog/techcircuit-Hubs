import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Cpu } from 'lucide-react';
import { Project } from '../../types';

interface ProjectImageProps {
  project: Project;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
}

const projectImageCandidates = (project: Project): string[] => {
  const number = project.id.match(/\d+/)?.[0];
  const canonical = number
    ? [
        `/projects/ece${number}.jpg`,
        `/projects/ece ${number}.png`,
        `/projects/ece ${number}.jpg`,
      ]
    : [];

  return [...new Set([...(project.images || []), ...canonical].filter(Boolean))];
};

export const ProjectImage: React.FC<ProjectImageProps> = ({
  project,
  className = '',
  imageClassName = '',
  children,
}) => {
  const candidates = useMemo(() => projectImageCandidates(project), [project.id, project.images]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [project.id]);

  const currentImage = candidates[candidateIndex];

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-orange-50 ${className}`}>
      {currentImage ? (
        <img
          src={currentImage}
          alt={project.title}
          className={imageClassName}
          onError={() => setCandidateIndex((index) => index + 1)}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-orange-300" role="img" aria-label={`${project.title} image unavailable`}>
          <Cpu className="h-9 w-9" />
          <span className="text-xs font-medium">Project image unavailable</span>
        </div>
      )}
      {children}
    </div>
  );
};
