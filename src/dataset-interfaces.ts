
export type SubjectName = string | 'not set';

export interface ISubjectDescriptor  {
    name: SubjectName;
 
    /**
     * The name of the subject or 'No subject' if we're the default
     * subject for a recording.
     */
    displayName: string;
 
    /**
     * @prop inputFieldName is the string to use for input fields. Will be blank if
     * name is not set.
     */
    inputFieldName: string;
 
    equals(other?: ISubjectDescriptor): boolean;
    nameMatches(name: string): boolean;
 }

export function subjectDescriptorsAreEqual(
    s1: ISubjectDescriptor | undefined,
    s2: ISubjectDescriptor | undefined
 ) {
    if (!s1 && !s2) return true;
 
    if (s1 && !s2) return false;
 
    if (!s1 && s2) return false;
 
    return s1!.equals(s2!);
 }