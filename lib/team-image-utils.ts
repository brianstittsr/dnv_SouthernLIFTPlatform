export interface MatchableMember {
  imageName: string;
  name: string;
}

export function findMatchingImage(
  member: MatchableMember,
  images: { id: string; name: string }[]
): { id: string; name: string } | undefined {
  const memberImageNameLower = member.imageName.toLowerCase();
  const memberNameLower = member.name.toLowerCase();
  const nameParts = member.name.split(" ");
  const firstName = nameParts[0].toLowerCase();
  const lastName = nameParts[nameParts.length - 1].toLowerCase();

  return images.find((img) => {
    const n = img.name.toLowerCase();
    if (n === memberImageNameLower) return true;
    if (n.includes(memberImageNameLower)) return true;
    if (n.includes(`${lastName}_${firstName}`)) return true;
    if (n.replace(/_/g, " ").includes(memberNameLower)) return true;
    if (n.includes(firstName) && n.includes(lastName)) return true;
    return false;
  });
}

export function buildImageUrl(imageId: string): string {
  return `/api/images/${imageId}`;
}
