get_crtime() {

  for target in "${@}"; do
    inode=$(stat -c %i "${target}")
    fs=$(df  --output=source "${target}"  | tail -1)
    crtime=$(sudo debugfs -R 'stat <'"${inode}"'>' "${fs}" 2>/dev/null | 
    grep -oP 'crtime.*--\s*\K.*')
    printf "%s\t%s\n" "${target}" "${crtime}"
  done
    }
