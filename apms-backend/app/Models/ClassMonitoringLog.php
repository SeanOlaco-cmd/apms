<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassMonitoringLog extends Model
{
    protected $fillable = [
        'academic_period_id',
        'school_id',
        'program_id',
        'instructor_name',
        'subject_code',
        'section',
        'verdict',
        'minutes_early',
        'monitored_on',
        'remarks',
        'recorded_by',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
    public function program()
    {
        return $this->belongsTo(Program::class);
    }
    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
